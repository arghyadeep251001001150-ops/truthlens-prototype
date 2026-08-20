// Clean light-mode SVG Data URLs for reliable sample images
const createLightSvgDataUrl = (title, subtitle, badgeText, bgStart, bgEnd, badgeBg, badgeColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <rect x="20" y="20" width="560" height="360" rx="16" fill="#ffffff" opacity="0.92"/>
    <circle cx="300" cy="155" r="70" fill="none" stroke="${badgeColor}" stroke-width="2.5" stroke-dasharray="6 6"/>
    <circle cx="300" cy="155" r="40" fill="${bgStart}" opacity="0.8"/>
    <path d="M 240 225 Q 300 175 360 225" fill="none" stroke="${badgeColor}" stroke-width="2.5"/>
    <rect x="180" y="265" width="240" height="28" rx="6" fill="${badgeBg}"/>
    <text x="300" y="284" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="${badgeColor}" text-anchor="middle">${badgeText}</text>
    <text x="300" y="325" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#0f172a" text-anchor="middle">${title}</text>
    <text x="300" y="350" font-family="Inter, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SAMPLE_CLAIMS = [
  {
    id: "sample-1",
    category: "Sports & Media",
    title: "Viral quote from Virat Kohli responding to Harsha Bhogle",
    sourceText: "A viral audio clip claims Virat Kohli publicly confronted commentator Harsha Bhogle during the post-match presentation regarding strike rate criticism.",
    verdict: "Disputed",
    confidence: 78,
    summary: "Audio clip circulating across social channels contains micro-splicing edits and synthetic cadence shifts. Official broadcast logs and BCCI presentation footage do not contain this interaction, though related off-record banter remains unverified."
  },
  {
    id: "sample-2",
    category: "Policy & Environment",
    title: "Eco-tourism sustainability regulations in Kerala and Goa",
    sourceText: "The Ministry of Tourism in coordination with Kerala and Goa state wildlife boards announced mandatory daily visitor quotas and single-use plastic bans across 14 coastal heritage zones.",
    verdict: "True",
    confidence: 95,
    summary: "Official gazette notification confirmed by state tourism directorates. The joint eco-restoration framework takes effect with registered carrying-capacity enforcement."
  },
  {
    id: "sample-3",
    category: "Materials Science",
    title: "Acceptor impurity increases p-type semiconductor conductivity",
    sourceText: "A widely shared preprint alleges a co-doped gallium nitride lattice achieved a 500% room-temperature conductivity jump without cryogenic cooling.",
    verdict: "False",
    confidence: 82,
    summary: "Independent replication by academic semiconductor consortia revealed measurement artifacting caused by probe contact resistance. Confirmed true enhancement was under 4%."
  },
  {
    id: "sample-4",
    category: "Mathematics",
    title: "Theorem regarding the roots of analytic functions in complex analysis",
    sourceText: "New mathematical proof confirms generalized boundary behavior for zeroes of meromorphic functions on open Riemann surfaces.",
    verdict: "True",
    confidence: 92,
    summary: "Peer-reviewed publication in Annals of Mathematics verified the analytic continuation proof. Rigorous topological validation confirmed by independent algebraists."
  }
];

export const SAMPLE_IMAGES = [
  {
    id: "img-1",
    title: "Watercolor painting of a bustling market",
    style: "Simulated Traditional Watercolor",
    imageUrl: createLightSvgDataUrl("Bustling Market Watercolor", "Traditional Fine Art Emulation", "AI-GENERATED • 99%", "#f0fdf4", "#e0e7ff", "#fff1f2", "#e11d48"),
    verdict: "AI-Generated",
    confidence: 99,
    summary: "Synthetic watercolor emulation detected with high confidence. Micro-texture inspection shows impossible continuous pigment bleeding, uniform digital anti-aliasing, and zero genuine paper capillary fiber absorption."
  },
  {
    id: "img-2",
    title: "Documentary street scene (Tokyo Night)",
    style: "Optical Camera Capture",
    imageUrl: createLightSvgDataUrl("Tokyo Street Scene", "Canon EOS 5D MK IV Optical Capture", "AUTHENTIC • 96%", "#ecfdf5", "#f0fdfa", "#ecfdf5", "#059669"),
    verdict: "Authentic",
    confidence: 96,
    summary: "Authentic camera photograph verified. Natural Poisson-Gaussian sensor noise distribution, true depth-of-field lens dispersion, and genuine camera metadata match physical hardware capture."
  },
  {
    id: "img-3",
    title: "Hand-drawn charcoal & graphite portrait",
    style: "Simulated Graphite on Paper",
    imageUrl: createLightSvgDataUrl("Charcoal Study", "Faux Hand-Drawn Graphite Look", "AI-GENERATED • 94%", "#f8fafc", "#f1f5f9", "#fff1f2", "#e11d48"),
    verdict: "AI-Generated",
    confidence: 94,
    summary: "Synthetic sketch emulation flagged. Cross-hatching exhibits uniform digital stroke pressure and repeating mathematical line patterns inconsistent with authentic hand drawing."
  },
  {
    id: "img-4",
    title: "Hyper-realistic architectural pavilion concept",
    style: "Hyper-Realistic 3D Architectural Scene",
    imageUrl: createLightSvgDataUrl("Pavilion Concept", "Hyper-Realistic 3D Render", "AI-GENERATED • 92%", "#f0f9ff", "#e0f2fe", "#fff1f2", "#e11d48"),
    verdict: "AI-Generated",
    confidence: 92,
    summary: "AI-synthesized 3D render identified. Physical lighting inconsistencies detected between environmental sky illumination and specular highlights on curved glass surfaces."
  }
];

// Initial state strictly initialized as empty array for live demo
export const INITIAL_VERIFICATION_HISTORY = [];

export const USER_PROFILE = {
  name: "Dr. Elena Vance",
  email: "elena.vance@truthlens.ai",
  role: "Lead Fact Analyst",
  tier: "Standard MVP"
};
