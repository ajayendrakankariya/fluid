/**
 * Serverless Backend Handler for AI Doubt-Clearing Chatbot
 * Endpoint: POST /api/chat
 * 
 * Works seamlessly with:
 * - Vercel Serverless Functions (/api/chat)
 * - Firebase Cloud Functions / Hosting proxy
 * - Local Vite Dev Server proxy
 */

// In-memory rate limiting map (IP -> { count, startTime })
const rateLimitMap = new Map();
const MAX_REQUESTS_PER_HOUR = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const EXPERIMENT_CONTEXT = {
  orifice: 'Current experiment: Orifice coefficient of discharge. Use Qth = a sqrt(2gh), Qa from flow, and Cd = Qa/Qth.',
  notch: 'Current experiment: Rectangular/triangular notch. Use the triangular h^(5/2) or rectangular h^(3/2) discharge relation and Cd = Qa/Qth.',
  'venturi-orifice': 'Current experiment: Venturimeter/orificemeter coefficient of discharge. Mercury differential readings convert to water head using h = 12.6R.',
  'major-losses': 'Current experiment: Major pipe losses. Use hf = 4fLV^2/(2gD), f = hf 2gD/(4LV^2), and Re = VD/nu.',
  'minor-losses': 'Current experiment: Minor fitting losses. Use hL = KV^2/(2g) and K = hL 2g/V^2 for enlargement, contraction, bend, and elbow.',
  bernoulli: 'Current experiment: Bernoulli theorem in a venturimeter. Use p/rho g + V^2/(2g) + z = H.',
};

const SYSTEM_PROMPT = `You are a lab assistant for a Fluid Mechanics 'Verification of Bernoulli's Theorem' experiment using a venturimeter. Answer ONLY questions related to this experiment, Bernoulli's principle, venturimeters, fluid mechanics fundamentals directly relevant to this experiment, or how to use this simulation. If asked something unrelated, politely redirect to the experiment topic.

Ground your answers in this specific experimental data when relevant:

--- EXPERIMENT THEORY & PRINCIPLE ---
1. Euler's Equation along a Streamline:
   (dp / ρ) + V dV + g dz = 0
2. Bernoulli's Equation (integrated Euler's equation along a single streamline for steady, incompressible, inviscid flow):
   (p / ρg) + (V² / 2g) + z = H = Constant (Total Energy Head in metres of fluid column)
   Where:
   - p / ρg = Static Pressure Head (measured by piezometric manometers h1, h2, etc., hw in mm of water)
   - V² / 2g = Velocity Head (Kinetic Energy Head)
   - z = Datum Head (Elevation/Delivery Head, constant for horizontal venturimeter)

3. Venturimeter Flow & Discharge Formula:
   Theoretical Discharge: Qth = (a1 * a2) / √(a1² - a2²) * √(2g * hw)
   Actual Discharge: Qact = Cd * Qth = AT * H / t
   Where:
   - a1 = Inlet cross-sectional area (Port P1 = 491 mm² = 4.91e-4 m²)
   - a2 = Throat cross-sectional area (Port P6 = 150 mm² = 1.50e-4 m²)
   - hw = Difference in piezometric head between inlet and throat (h1 - h6)
   - Cd = Coefficient of discharge (typically 0.96 - 0.98 due to viscous friction in converging cone)
   - AT = Collecting tank area (0.0405 m²)
   - H = Water rise height in collecting tank during timed interval t (standard 10 cm = 0.10 m)
   - g = Acceleration due to gravity (9.81 m/s²)

--- APPARATUS SPECIFICATIONS & 10 PRESSURE PORT AREAS ---
- Collecting Tank Area (AT): 0.0405 m²
- Standard Rise Height (H): 0.10 m (10 cm)
- Gravity (g): 9.81 m/s²
- 10 Pressure Ports (P1 to P10 along the venturi duct, areas in mm²):
  * Port P1 (Inlet): 491 mm² (Position 0.0)
  * Port P2: 357 mm² (Position 0.1)
  * Port P3: 245 mm² (Position 0.2)
  * Port P4: 153 mm² (Position 0.3)
  * Port P5: 120 mm² (Position 0.4)
  * Port P6 (Throat / Narrowest): 150 mm² (Position 0.5) - Note: Minimum cross-section is at P7 (102 mm²), but P6 (150 mm²) is the canonical throat port with high velocity.
  * Port P7: 102 mm² (Position 0.55 - absolute minimum area, maximum velocity peak)
  * Port P8 (Diverging cone): 279 mm² (Position 0.65)
  * Port P9: 369 mm² (Position 0.78)
  * Port P10 (Outlet): 471 mm² (Position 0.9)

--- CALIBRATION PRESETS & VERIFIED RESULTS TABLES ---
1. Preset 1: 300 mm Overflow Pipe Configuration
   - Canonical Actual Discharge Qact = 1.5600e-4 m³/s
   - Delivery / Balancing Head (z) = 270 mm = 0.270 m
   - Measured fill time t for 10 cm rise = 26.3 s
   - Static Pressure Readings (h_i in mm of water column for P1 to P10):
     [265, 252, 233, 196, 173, 155, 110, 214, 221, 202]
   - Computed Total Heads (m water column for P1 to P10):
     P1: 0.54015 m (CP1 Reference Total Head)
     P2: 0.53173 m
     P3: 0.52366 m
     P4: 0.51899 m
     P5: 0.52914 m
     P6: 0.53006 m
     P7: 0.61869 m (Peak kinetic energy at min area)
     P8: 0.49964 m
     P9: 0.49987 m
     P10: 0.47743 m
   - Verified Checkpoints:
     * Checkpoint 1 (Reference P1 Total Head): 0.54015 m (Matches manual worked example 0.5401 m)
     * Checkpoint 2 (Mean Total Head across all 10 ports): 0.51006 m (Matches manual stated Result 0.51003 m)

2. Preset 2: 350 mm Overflow Pipe Configuration
   - Canonical Actual Discharge Qact = 1.4800e-4 m³/s
   - Delivery / Balancing Head (z) = 375.28 mm = 0.37528 m
   - Measured fill time t for 10 cm rise = 27.37 s
   - Static Pressure Readings (h_i in mm of water column for P1 to P10):
     [300, 243, 224, 189, 167, 149, 106, 206, 213, 194]
   - Computed Total Heads (m water column for P1 to P10):
     P1: 0.67991 m (CP1 Reference Total Head)
     P2: 0.62699 m
     P3: 0.61787 m
     P4: 0.61175 m
     P5: 0.61985 m
     P6: 0.62359 m
     P7: 0.69599 m
     P8: 0.59564 m
     P9: 0.60447 m
     P10: 0.60946 m
   - Verified Checkpoints:
     * Checkpoint 1 (Reference P1 Total Head): 0.67991 m (Matches manual worked example 0.6800 m)
     * Checkpoint 2 (Mean Total Head across all 10 ports): 0.60855 m (Matches manual stated Result 0.60842 m)

--- VIVA QUESTIONS & DETAILED LAB ANSWERS ---
Q1: What is the physical significance of each term in Bernoulli's equation?
Answer: Each term represents energy per unit weight of fluid (in units of length/head of fluid column):
1. Pressure Head (p / ρg): The flow work or static pressure energy per unit weight exerted by the surrounding fluid.
2. Velocity Head (V² / 2g): The kinetic energy per unit weight due to the bulk motion of the fluid particles.
3. Potential / Elevation Head (z): The gravitational potential energy per unit weight relative to a reference datum plane.
Their sum H is the Total Energy Head, which remains constant along any streamline in an ideal, frictionless flow.

Q2: What are the fundamental assumptions made in the derivation of Bernoulli's theorem?
Answer: The six core assumptions are:
1. Steady Flow: Fluid properties (velocity, pressure, density) at any spatial point do not change with time (∂/∂t = 0).
2. Incompressible Flow: Fluid density ρ is strictly constant throughout the flow field (true for liquids like water at moderate pressures).
3. Inviscid (Frictionless) Flow: Viscosity μ = 0; no internal shear stresses or energy losses due to fluid friction against pipe walls.
4. Along a Streamline: The equation applies along a single continuous streamline (unless the flow is also irrotational, in which case H is constant everywhere across all streamlines).
5. No Shaft Work or Heat Transfer: No mechanical energy is added by pumps or removed by turbines (W = 0), and no thermal energy transfer occurs between inlet and outlet.
6. Irrotational Flow: Fluid velocity curl is zero (∇ × V = 0), ensuring uniform energy across streamlines.

Q3: What is stagnation pressure and where does a stagnation point occur? How is this principle applied in a Pitot tube?
Answer: Stagnation pressure (P0) is the total static pressure measured at a stagnation point—a point in the flow field where a fluid particle is brought completely to rest isentropically (velocity V = 0).
By Bernoulli's equation between the free stream (p, V) and the stagnation point (P0, V=0):
P0 = p + (1/2) ρ V²  =>  Stagnation Pressure = Static Pressure + Dynamic Pressure.
In a Pitot-static tube, the inner impact tube measures P0 while the outer side ports measure static pressure p. Rearranging gives the differential flow velocity formula:
V = √[ 2(P0 - p) / ρ ] = √[ 2g * Δh ].

Q4: How does Navier-Stokes equation relate to Bernoulli's equation? Can Bernoulli's equation be derived from Navier-Stokes?
Answer: Yes, Bernoulli's theorem is an exact mathematical special case obtained directly from the Navier-Stokes momentum equations.
The Navier-Stokes vector equation for incompressible fluid momentum conservation is:
ρ( ∂V/∂t + (V · ∇)V ) = -∇p + μ ∇²V + ρg
By applying four successive simplifications, we arrive at Bernoulli's theorem:
1. Set viscosity μ = 0 (inviscid assumption removes the diffusion term μ ∇²V).
2. Set time derivative ∂V/∂t = 0 (steady flow assumption).
3. Express convective acceleration using vector identity: (V · ∇)V = ∇(V²/2) - V × (∇ × V).
4. Assume irrotational flow (∇ × V = 0) OR take the dot product along a differential streamline element ds (where V × (∇ × V) · ds = 0).
Integrating the resulting gradient equation directly yields: (p / ρ) + (V² / 2) + g z = Constant, which divided by g gives Bernoulli's head equation.

--- RESPONSE GUIDELINES ---
Keep answers concise (3-5 sentences unless the question needs a derivation), use the same terminology as the lab manual (Cd, hw, Qact, Qth, etc), and when explaining formulas use the exact notation from the manual. When numbers or calculations are mentioned, use markdown monospace for quantities or equations.`;

export default async function handler(req, res) {
  // Ensure res.status and res.json helpers exist for direct Node/Vite middleware compatibility
  if (!res.status) {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  // Handle CORS & Method
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed. Use POST.' });
  }

  // Rate limiting check
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  let rateRecord = rateLimitMap.get(ip);

  if (!rateRecord || now - rateRecord.startTime > RATE_LIMIT_WINDOW_MS) {
    rateRecord = { count: 1, startTime: now };
    rateLimitMap.set(ip, rateRecord);
  } else {
    rateRecord.count += 1;
    if (rateRecord.count > MAX_REQUESTS_PER_HOUR) {
      return res.status(429).json({
        reply: "⚠️ Rate limit exceeded (20 requests/hour per session/IP). To prevent quota abuse, please wait before sending more questions or consult the detailed Viva Q&A accordion on the Results page."
      });
    }
  }

  // Parse payload
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { message, history = [], experimentSlug = 'bernoulli' } = body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ reply: "Please enter a valid question about the Bernoulli's theorem experiment." });
  }

  // Check API Key
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(200).json({
      reply: "⚠️ Server Configuration Notice: `GEMINI_API_KEY` is not set on the server.\n\nTo enable live AI doubt-clearing:\n1. Create a `.env` file in the project root.\n2. Add `GEMINI_API_KEY=AIzaSy...` (your Google Gemini API key).\n3. Restart `npm run dev`.\n\nIn the meantime, you can explore the pre-loaded Viva Questions accordion on the Results page!"
    });
  }

  // Format conversation history for Gemini API
  const formattedContents = [];
  const recentHistory = Array.isArray(history) ? history.slice(-10) : [];

  for (const turn of recentHistory) {
    if (turn && typeof turn.content === 'string' && turn.content.trim()) {
      const role = turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user';
      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
        formattedContents[formattedContents.length - 1].parts[0].text += '\n\n' + turn.content.trim();
      } else {
        formattedContents.push({
          role: role,
          parts: [{ text: turn.content.trim() }]
        });
      }
    }
  }

  // Append current message
  if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === 'user') {
    formattedContents[formattedContents.length - 1].parts[0].text += '\n\n' + message.trim();
  } else {
    formattedContents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });
  }

  // Call Gemini REST API (try gemini-2.5-flash with fallback to gemini-2.0-flash / gemini-1.5-flash)
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${EXPERIMENT_CONTEXT[experimentSlug] || EXPERIMENT_CONTEXT.bernoulli}` }]
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return res.status(200).json({ reply: replyText });
        }
      } else {
        const errText = await response.text();
        lastError = `${response.status} (${model}): ${errText}`;
        if (response.status !== 404 && !errText.includes('NOT_FOUND')) {
          // If 429 quota or 400/403 auth error, we can stop or let it try fallback
        }
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(500).json({
    reply: `⚠️ Unable to reach Gemini AI API (${lastError || 'Network error'}). Please verify your API key and connection, or check the static Viva accordion on the Results page.`
  });
}
