import { BookOpen, Droplets, Zap, Gauge } from 'lucide-react';

const energyForms = [
  {
    Icon: Gauge,
    title: 'Pressure Energy',
    symbol: 'p / ρg',
    unit: 'm water',
    color: '#0D9488',
    desc: 'Energy stored in the fluid due to its pressure. In the venturimeter, this is directly measured by the piezometer (manometer) tubes. High in wide sections, drops at the narrow throat as kinetic energy increases.',
    physical: 'Acts perpendicular to flow — it is the "push" energy from surrounding fluid.',
  },
  {
    Icon: Zap,
    title: 'Kinetic Energy',
    symbol: 'V² / 2g',
    unit: 'm water',
    color: '#F59E0B',
    desc: 'Energy due to the fluid\'s velocity of motion. Peaks at the venturi throat where cross-section is minimum (by continuity: A₁V₁ = A₂V₂). This is what the venturimeter uses to infer flow rate.',
    physical: 'Acts parallel to flow — it is the "speed" energy of directed motion.',
  },
  {
    Icon: Droplets,
    title: 'Potential Energy',
    symbol: 'z',
    unit: 'm (elevation)',
    color: '#6366F1',
    desc: 'Energy due to elevation above a datum (reference level). For a horizontal venturimeter (as in this experiment), z is constant and drops out of the equation — only pressure and kinetic terms vary.',
    physical: 'Acts in the direction of gravity — it is the gravitational "height" energy.',
  },
];

const assumptions = [
  {
    label: 'Steady Flow',
    detail: 'Flow properties at any point do not change with time. In real experiments, some unsteadiness exists during startup and valve changes.',
  },
  {
    label: 'Incompressible Flow',
    detail: 'Fluid density ρ is constant — valid for water at normal lab conditions (liquids are essentially incompressible). Not valid for gases at high speeds.',
  },
  {
    label: 'Inviscid Flow',
    detail: 'Viscous friction forces are neglected. In reality, viscosity causes boundary layer losses, which is why actual total head decreases slightly along the pipe.',
  },
  {
    label: 'Along a Streamline',
    detail: "Bernoulli's equation applies between two points on the same streamline. In a well-designed venturimeter with attached flow, the entire core flow behaves as if on one streamline.",
  },
  {
    label: 'No Energy Addition/Removal',
    detail: 'No pump work or heat transfer between the two points. This experiment measures purely passive fluid mechanics downstream of the pump.',
  },
];

export default function TheoryPage() {
  return (
    <div className="page">
      <div className="page-inner" style={{ maxWidth: 900 }}>

        <div className="page-header">
          <h1>Theory — Bernoulli's Theorem</h1>
          <p>Derivation, physical interpretation, and application to the venturimeter flow measurement.</p>
        </div>

        {/* ── Aim ── */}
        <section style={{ marginBottom: 40 }}>
          <div className="panel-label">Aim of Experiment</div>
          <div className="callout">
            To verify Bernoulli's theorem experimentally using a venturimeter, and to show that the
            total energy head (pressure head + velocity head + datum head) remains approximately
            constant along a streamline in steady, incompressible flow.
          </div>
        </section>

        {/* ── Derivation flow ── */}
        <section style={{ marginBottom: 40 }}>
          <div className="panel-label">Derivation from First Principles</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8, letterSpacing: '0.06em' }}>STEP 1 — EULER'S EQUATION OF MOTION</div>
              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
                Apply Newton's second law to a fluid element along a streamline. For an inviscid fluid,
                the only forces are pressure and gravity:
              </p>
              <div className="equation" style={{ fontSize: 14, margin: '12px 0 0' }}>
                <span className="eq-teal">−(1/ρ)(dp/ds)</span> − g(dz/ds) = V(dV/ds)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', fontSize: 20, color: '#CBD5E1' }}>↓</div>

            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8, letterSpacing: '0.06em' }}>STEP 2 — INTEGRATE ALONG STREAMLINE</div>
              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
                Integrating Euler's equation between two points on the same streamline (assuming constant ρ):
              </p>
              <div className="equation" style={{ fontSize: 14, margin: '12px 0 0' }}>
                ∫(dp/ρ) + ∫V dV + g∫dz = 0
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', fontSize: 20, color: '#CBD5E1' }}>↓</div>

            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 8, letterSpacing: '0.06em' }}>STEP 3 — BERNOULLI'S EQUATION (ENERGY PER UNIT WEIGHT)</div>
              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
                Dividing by g and rearranging gives the familiar head form:
              </p>
              <div className="equation" style={{ fontSize: 16, margin: '12px 0 0', letterSpacing: '0.02em' }}>
                <span className="eq-teal">p₁/ρg</span> + <span className="eq-amber">V₁²/2g</span> + z₁ =
                &nbsp;<span className="eq-teal">p₂/ρg</span> + <span className="eq-amber">V₂²/2g</span> + z₂ = <strong>H</strong>
              </div>
              <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 10, textAlign: 'center' }}>
                where H is the total energy head (constant along the streamline in ideal flow)
              </p>
            </div>
          </div>
        </section>

        {/* ── Three energy forms ── */}
        <section style={{ marginBottom: 40 }}>
          <div className="panel-label">The Three Energy Forms</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {energyForms.map(({ Icon, title, symbol, unit, color, desc, physical }) => (
              <div key={title} className="card" style={{ padding: '20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{title}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color }}>H = {symbol}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.65, marginBottom: 10 }}>{desc}</div>
                <div style={{ fontSize: 11.5, color: '#94A3B8', fontStyle: 'italic' }}>{physical}</div>
                <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 6, background: `${color}0F`, fontSize: 11, fontFamily: "'IBM Plex Mono'", color }}>
                  Units: {unit}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Venturimeter application ── */}
        <section style={{ marginBottom: 40 }}>
          <div className="panel-label">Application to Venturimeter</div>
          <div className="card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.75, marginBottom: 16 }}>
              A <strong>venturimeter</strong> exploits Bernoulli's theorem to measure flow rate. By creating a
              controlled constriction (the throat), the velocity increases — and the corresponding
              pressure drop can be measured by manometers. Applying Bernoulli between the inlet (1)
              and throat (2), with z₁ = z₂ (horizontal pipe):
            </p>
            <div className="equation" style={{ fontSize: 15, margin: '0 0 16px' }}>
              Q = <span className="eq-amber">C<sub>d</sub></span> · A₁A₂ · √<span style={{ borderTop: '2px solid #fff' }}>2g(h₁−h₂)</span> / √(A₁²−A₂²)
            </div>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>
              In this experiment, we measure Q using the collecting tank method (timing 10 cm water rise)
              rather than from the pressure difference alone. This allows us to verify that the computed
              total head H = p/ρg + V²/2g + z is indeed constant across all 10 ports.
            </p>
          </div>
        </section>

        {/* ── Assumptions ── */}
        <section>
          <div className="panel-label">Assumptions of Bernoulli's Theorem</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assumptions.map(({ label, detail }, i) => (
              <div key={label} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 14 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'rgba(13,148,136,0.12)',
                  color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'IBM Plex Mono'", fontSize: 11, fontWeight: 700, flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4, color: '#0F172A' }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
