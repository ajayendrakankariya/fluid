/**
 * Offline doubt-clearing answers used when GEMINI_API_KEY is unavailable.
 * Matches common viva / conceptual questions for Experiment 8.
 */

const FAQ = [
  {
    keywords: ['why', 'dip', 'throat', 'actual', 'line', 'loss'],
    answer:
      'The actual total-head line dips near the throat because real flow is not perfectly inviscid. As water accelerates through the converging cone, friction and mild turbulence convert some mechanical energy into heat. Ideal Bernoulli predicts a flat TEL; the gap between the theoretical mean and the measured curve is those irreversible losses — which is also why venturimeter Cd is slightly less than 1.',
  },
  {
    keywords: ['difference', 'p1', 'mean', 'total head', 'checkpoint'],
    answer:
      '`P1 total head` is the reference value at the inlet port from the worked example (Checkpoint 1). `Mean total head` averages H across all ten ports (Checkpoint 2). They differ because friction losses accumulate along the duct, so downstream ports sit slightly below the inlet total head.',
  },
  {
    keywords: ['stagnation', 'pitot'],
    answer:
      'A stagnation point is where local velocity becomes zero and kinetic energy converts into pressure. Stagnation pressure `P0 = p + ½ρV²`. A Pitot-static tube measures P0 at the tip and static pressure on the side ports, then recovers speed from `V = √[2(P0 − p)/ρ]`.',
  },
  {
    keywords: ['assumption', 'bernoulli'],
    answer:
      "Bernoulli's theorem assumes: (1) steady flow, (2) incompressible fluid, (3) inviscid (frictionless) flow, (4) application along a streamline, (5) no shaft work or heat transfer between the points, and (6) often irrotational core flow. Lab water nearly satisfies (1)–(2); viscosity makes (3) approximate — hence small head losses.",
  },
  {
    keywords: ['navier', 'stokes'],
    answer:
      "Bernoulli is a special case of Navier–Stokes. Start from ρ(∂V/∂t + V·∇V) = −∇p + μ∇²V + ρg, set μ = 0 (Euler), set ∂V/∂t = 0 (steady), then integrate along a streamline to obtain `p/ρ + V²/2 + gz = constant`, or in head form `p/ρg + V²/2g + z = H`.",
  },
  {
    keywords: ['pressure', 'velocity', 'potential', 'term', 'significance', 'equation'],
    answer:
      'Each term is energy per unit weight (metres of fluid): `p/ρg` = pressure (flow work) head, `V²/2g` = kinetic head, `z` = elevation head. Their sum H is total mechanical energy head. In a horizontal venturimeter z is constant, so pressure and velocity heads trade off as area changes.',
  },
  {
    keywords: ['discharge', 'q', 'tank', 'time', 'how'],
    answer:
      'Actual discharge is measured independently of the venturi formula: `Q = A_T × H / t` with tank area A_T = 0.0405 m² and rise H = 0.10 m. Presets also store a canonical Q so Checkpoint 1/2 match the lab manual exactly.',
  },
  {
    keywords: ['venturi', 'how', 'work', 'continuity'],
    answer:
      'By continuity, `A₁V₁ = A₂V₂`. At the throat A is smallest, so V is largest and (by Bernoulli) static pressure falls. Piezometers read that pressure drop; combined with areas it yields flow rate. The diverging cone recovers most of the pressure with low loss.',
  },
  {
    keywords: ['preset', '300', '350', 'overflow'],
    answer:
      'Two calibration presets mirror the lab manual: **300 mm overflow** (Q ≈ 1.56×10⁻⁴ m³/s, delivery head 270 mm) and **350 mm overflow** (Q ≈ 1.48×10⁻⁴ m³/s, delivery head 375.28 mm). Switching a preset reloads manometer readings and recomputes all heads.',
  },
  {
    keywords: ['diameter', 'speed', 'control', 'slider'],
    answer:
      'Use the **flow speed** slider to scale discharge (faster particles, higher velocity heads). Use the **tube diameter scale** to enlarge/shrink all cross-sections (area ∝ d²). Both update the table and graphs live; switch back to a named preset anytime to restore calibrated lab-manual numbers.',
  },
];

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Rank FAQ entries by keyword hits. Returns best match or a generic fallback.
 */
export function getOfflineAnswer(question) {
  const q = normalize(question || '');
  if (!q) {
    return 'Ask a question about Bernoulli’s theorem, the venturimeter, or how to use this virtual lab.';
  }

  let best = null;
  let bestScore = 0;

  for (const entry of FAQ) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (best && bestScore > 0) {
    return `${best.answer}\n\n_(Offline lab assistant — set \`GEMINI_API_KEY\` in \`.env\` for richer AI answers.)_`;
  }

  return (
    'I can help with Bernoulli heads, venturimeter ports P1–P10, presets, stagnation pressure, assumptions, ' +
    'Navier–Stokes → Bernoulli, and how the simulation controls work.\n\n' +
    'Try: "Why does the actual line dip at the throat?" or "Explain the terms in Bernoulli\'s equation."\n\n' +
    '_(No API key detected — answering from the built-in Experiment 8 FAQ. Add `GEMINI_API_KEY` to `.env` for live AI.)_'
  );
}
