// TruthLens — Supabase Edge Function: verify-claim
// Runs server-side (Deno runtime). API keys are never sent to the browser.
// Deploy: npx supabase functions deploy verify-claim --project-ref tspmlmpkspffsghubxyz

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow requests from local dev and from any Supabase-hosted frontend.
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://tspmlmpkspffsghubxyz.supabase.co",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeExtractJSON(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        // fall through
      }
    }
  }
  return null;
}

function aggressiveClean(text: string): string {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim();
}

function regexExtractVerdict(text: string): Record<string, unknown> {
  const verdictMatch = text.match(/\b(True|False|Disputed)\b/i);
  const confidenceMatch = text.match(/["']?confidence["']?\s*[:\s]+(\d{1,3})/i);
  const summaryMatch =
    text.match(/["']summary["']\s*:\s*["'](.+?)["']/i) ||
    text.match(/summary[:\s]+["']?(.{20,200})["']?/i);

  const rawVerdict = verdictMatch
    ? verdictMatch[1].charAt(0).toUpperCase() + verdictMatch[1].slice(1).toLowerCase()
    : "Disputed";
  const normalizedVerdict = ["True", "False", "Disputed"].includes(rawVerdict)
    ? rawVerdict
    : "Disputed";
  const confidence = confidenceMatch
    ? Math.min(100, Math.max(0, Number(confidenceMatch[1])))
    : 75;
  const summary = summaryMatch
    ? summaryMatch[1].trim()
    : "Verification completed via pattern extraction.";

  return { verdict: normalizedVerdict, confidence, summary };
}

// ── Gemini text models — ordered fastest-first ────────────────────────────────
const TEXT_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

const COT_SYSTEM_PROMPT = `You are TruthLens, an elite, flawless fact-checking engine.

CRITICAL INSTRUCTION: You must output ONLY raw, valid JSON. No markdown, no backticks, no conversational text.

LOGIC RULES:
1. Write a full step-by-step deduction in "initial_reasoning" FIRST.
2. Then in "critique", play devil's advocate — find flaws, bias, or missing context in your initial reasoning.
3. If the claim directly contradicts established science, math, or history, the verdict is "False".
4. If the claim is backed by absolute consensus, the verdict is "True".
5. If the claim is subjective, predictive, or lacks consensus, the verdict is "Disputed".
6. Let the critique inform and possibly revise your final verdict before committing.

SCHEMA (Strict):
{
  "initial_reasoning": "Step-by-step deduction of the claim.",
  "critique": "Play devil's advocate. Find flaws, bias, or missing context in your initial reasoning.",
  "verdict": "True" | "False" | "Disputed",
  "confidence": <integer 0-100>,
  "summary": "1-2 direct sentences explaining the final verdict."
}`;

// ── Pass 1: Google Fact Check Tools API ──────────────────────────────────────
async function runFactCheckPass(
  claimText: string,
  factCheckKey: string,
): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(claimText)}&key=${factCheckKey}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;

    const fcData = await res.json();
    const claims = fcData.claims || [];
    if (claims.length === 0) return null;

    const review = claims[0]?.claimReview?.[0];
    if (!review?.textualRating) return null;

    const rating = (review.textualRating || "").toLowerCase();
    let verdict = "Disputed";
    if (/\b(true|correct|accurate|confirmed|real)\b/.test(rating)) verdict = "True";
    else if (/\b(false|incorrect|inaccurate|fake|wrong|misleading|fabricated|pants on fire)\b/.test(rating)) verdict = "False";

    const publisher = review.publisher?.name || "Fact-check database";
    return {
      verdict,
      confidence: 95,
      summary: `${publisher} rated this claim as "${review.textualRating}". ${review.title || ""}`.trim(),
      modelUsed: `Google Fact Check API (${publisher})`,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ── Pass 2: Gemini multi-model chain ─────────────────────────────────────────
async function runGeminiPass(
  claimText: string,
  geminiKey: string,
): Promise<Record<string, unknown>> {
  let lastError: Error | null = null;

  for (const model of TEXT_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${geminiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: COT_SYSTEM_PROMPT },
                { role: "user", content: claimText },
              ],
              temperature: 0.0,
              max_tokens: 350,
              response_format: { type: "json_object" },
            }),
          },
        );

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 429) throw new Error(`429 Rate Limit on ${model}: ${errText}`);
          if (response.status === 503) throw new Error(`503 Server Overload on ${model}: ${errText}`);
          throw new Error(`API error ${response.status} on ${model}: ${errText}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content;
        if (!rawText) throw new Error("No response text from API");

        const cleaned = aggressiveClean(rawText);
        let parsed = safeExtractJSON(cleaned);
        if (!parsed || (!parsed.verdict && !parsed.summary)) {
          parsed = regexExtractVerdict(rawText);
        }

        if (parsed && (parsed.verdict || parsed.summary)) {
          return {
            verdict: parsed.verdict || "Disputed",
            confidence: Math.min(100, Math.max(0, Number(parsed.confidence) ?? 85)),
            summary: parsed.summary || "Fact verification completed.",
            modelUsed: model,
          };
        }
      } catch (err) {
        lastError = err as Error;
        const isRateLimit = (err as Error).message?.includes("429");
        const isOverload = (err as Error).message?.includes("503");
        if (isRateLimit || isOverload) throw err; // fast-fail
        if (attempt < 2) console.warn(`Attempt ${attempt} failed for ${model}, retrying:`, (err as Error).message);
      }
    }
  }

  throw lastError || new Error("All Gemini model endpoints failed after retries.");
}

// ── Pass 3: Claude Tool Use fallback ─────────────────────────────────────────
async function runClaudePass(
  claimText: string,
  anthropicKey: string,
): Promise<Record<string, unknown>> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 350,
      system: "You are an expert fact-checker. Evaluate claims objectively based on established facts, science, and consensus.",
      tools: [{
        name: "format_verdict",
        description: "Outputs the final fact-check verdict in strict JSON format.",
        input_schema: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["True", "False", "Disputed"] },
            confidence: { type: "integer", minimum: 0, maximum: 100 },
            summary: { type: "string", description: "1-2 direct sentences explaining the verdict." },
          },
          required: ["verdict", "confidence", "summary"],
        },
      }],
      tool_choice: { type: "tool", name: "format_verdict" },
      messages: [{ role: "user", content: `Analyze this claim: "${claimText}"` }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const toolBlock = data.content?.find((b: { type: string }) => b.type === "tool_use");
  if (toolBlock?.input) {
    return {
      verdict: toolBlock.input.verdict || "Disputed",
      confidence: toolBlock.input.confidence ?? 80,
      summary: toolBlock.input.summary || "Verified via Claude fallback.",
      modelUsed: "Claude 3.7 Sonnet (Tool Use)",
    };
  }
  throw new Error("Claude returned no valid tool_use block.");
}

// ── Main Handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Read secrets from Supabase secure environment (never exposed to browser)
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
  const FACT_CHECK_API_KEY = Deno.env.get("FACT_CHECK_API_KEY") ?? "";
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

  let body: { claimText?: string; inputType?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const claimText = (body.claimText || "").trim();
  if (!claimText) {
    return new Response(
      JSON.stringify({ error: "claimText is required", verdict: "Error", confidence: 0, summary: "No claim provided." }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  let result: Record<string, unknown>;

  try {
    // ── Pass 1: Google Fact Check (fast, authoritative) ───────────────────────
    if (FACT_CHECK_API_KEY) {
      const fcResult = await runFactCheckPass(claimText, FACT_CHECK_API_KEY);
      if (fcResult) {
        return new Response(JSON.stringify(fcResult), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
    }

    // ── Pass 2: Gemini multi-model chain ──────────────────────────────────────
    try {
      result = await runGeminiPass(claimText, GEMINI_API_KEY);
    } catch (geminiErr) {
      console.warn("Gemini pass failed, trying Claude:", (geminiErr as Error).message);

      // ── Pass 3: Claude Tool Use fallback ──────────────────────────────────
      if (ANTHROPIC_API_KEY) {
        try {
          result = await runClaudePass(claimText, ANTHROPIC_API_KEY);
        } catch (claudeErr) {
          console.error("Claude fallback also failed:", (claudeErr as Error).message);
          const geminiMsg = (geminiErr as Error).message || "";
          result = {
            verdict: "Error",
            confidence: 0,
            summary: geminiMsg.includes("429")
              ? "Free tier rate limit reached. Please wait a moment and try again."
              : geminiMsg.includes("503")
              ? "Gemini servers are experiencing high demand. Please retry in a few seconds."
              : "All verification engines failed. Please check your API configuration.",
          };
        }
      } else {
        // No Claude key — surface Gemini error
        const geminiMsg = (geminiErr as Error).message || "";
        result = {
          verdict: "Error",
          confidence: 0,
          summary: geminiMsg.includes("429")
            ? "Rate limit reached. Please wait a moment and try again."
            : "Verification service unavailable. Please retry shortly.",
        };
      }
    }
  } catch (unexpectedErr) {
    console.error("Unexpected edge function error:", unexpectedErr);
    result = {
      verdict: "Error",
      confidence: 0,
      summary: "An unexpected server error occurred. Please try again.",
    };
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
