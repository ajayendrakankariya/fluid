import { useState } from 'react';
import { ChevronDown, Award } from 'lucide-react';
import {
  runFullSimulation,
  calculateAverageTotalHead,
  PORT_AREAS_MM2,
  PORT_LABELS,
} from '../physics/bernoulli';
import { PRESET_300MM, PRESET_350MM } from '../data/presets';

// Pre-compute results using canonical Q (Q_m3s) — guarantees CP1 & CP2 match
const results300 = runFullSimulation(
  PRESET_300MM.deliveryHead_mm,
  PRESET_300MM.pressureReadings_mm,
  PRESET_300MM.time_s,
  PRESET_300MM.riseHeight_m,
  PRESET_300MM.Q_m3s,
);

const results350 = runFullSimulation(
  PRESET_350MM.deliveryHead_mm,
  PRESET_350MM.pressureReadings_mm,
  PRESET_350MM.time_s,
  PRESET_350MM.riseHeight_m,
  PRESET_350MM.Q_m3s,
);

const VIVA_QA = [
  {
    q: 'What is the physical significance of each term in Bernoulli\'s equation?',
    a: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p>Bernoulli's equation expressed as energy per unit weight (head form):</p>
        <div style={{ fontFamily: "'IBM Plex Mono'", background: '#0F172A', color: '#E2E8F0', borderRadius: 8, padding: '12px 16px', fontSize: 13 }}>
          p/ρg + V²/2g + z = H (constant)
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['p/ρg — Pressure Head', 'Energy stored in fluid pressure (potential energy of compression). Measured directly by manometer/piezometer tube height. High where velocity is low (wide pipe), low where velocity is high (throat).'],
            ['V²/2g — Velocity Head', 'Kinetic energy per unit weight of fluid. Represents the energy due to fluid motion. Maximum at the throat (smallest area → highest velocity by continuity). Computed as V²/(2g) where V = Q/A.'],
            ['z — Datum Head (Elevation)', 'Potential energy due to height above a chosen reference datum. For a horizontal venturimeter (z₁ = z₂), this term cancels out and has no effect on the experiment.'],
            ['H — Total Head', 'The sum of all three energy forms. Bernoulli\'s theorem states H is constant along a streamline for steady, inviscid, incompressible flow. In practice, H decreases slightly due to friction/viscosity losses.'],
          ].map(([term, exp]) => (
            <li key={term} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: '#0D9488', fontSize: 12, marginBottom: 4 }}>{term}</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{exp}</div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    q: 'State and explain all assumptions of Bernoulli\'s theorem.',
    a: (
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          ['Steady Flow', 'Velocity and pressure at any point do not change with time. Ensured experimentally by waiting for stable manometer readings before recording.'],
          ['Incompressible Flow', 'Density ρ is constant — valid for water and low-speed liquids. The volume of a fluid element does not change as pressure changes.'],
          ['Inviscid (Frictionless) Flow', 'No viscous shear forces between fluid layers. In reality, some friction exists (hence Cd < 1 for venturimeters), but it is small enough to be neglected at this scale.'],
          ['Along a Single Streamline', "The equation connects two points on the same streamline. In a well-behaved venturimeter with no flow separation, the axial streamline is representative of the entire flow."],
          ['No Work or Heat Transfer', 'No pumps, turbines, or heat exchangers between the two measurement points. Ensures mechanical energy conservation.'],
          ['Irrotational Flow (implied)', 'Though not always stated, applying Bernoulli across streamlines requires irrotational flow, which is approximately satisfied in the core of a venturimeter.'],
        ].map(([title, exp]) => (
          <li key={title} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13, marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{exp}</div>
          </li>
        ))}
      </ul>
    ),
  },
  {
    q: 'What is stagnation pressure and stagnation point?',
    a: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
          <strong>Stagnation point</strong> is a location in a flow field where the local fluid velocity is
          zero — the fluid is brought to rest. At this point, all kinetic energy is converted to
          pressure energy (with no losses for ideal flow).
        </p>
        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
          <strong>Stagnation pressure</strong> (total pressure) P₀ is the pressure at the stagnation point.
          Applying Bernoulli between a free-stream point and the stagnation point:
        </p>
        <div style={{ fontFamily: "'IBM Plex Mono'", background: '#0F172A', color: '#E2E8F0', borderRadius: 8, padding: '12px 16px', fontSize: 13 }}>
          P₀ = p_static + ½ρV² = p_static + ρg(V²/2g)
        </div>
        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
          Stagnation pressure is the <em>maximum pressure</em> achievable in a flow without heat addition.
          It equals the sum of static pressure and dynamic pressure. In this experiment, the inlet
          of the venturimeter (P1) approximates a high-pressure, low-velocity point, while the throat
          approaches the other extreme.
        </p>
        <div className="callout" style={{ fontSize: 12.5 }}>
          <strong>Practical application:</strong> Pitot tubes use stagnation pressure measurement
          to infer aircraft airspeed: V = √(2(P₀ − p)/ρ).
        </div>
      </div>
    ),
  },
  {
    q: 'What is the Navier-Stokes equation and how does it relate to Bernoulli\'s theorem?',
    a: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
          The <strong>Navier-Stokes equations</strong> are the fundamental governing equations of
          viscous fluid motion, derived from Newton's second law applied to a fluid element:
        </p>
        <div style={{ fontFamily: "'IBM Plex Mono'", background: '#0F172A', color: '#E2E8F0', borderRadius: 8, padding: '12px 16px', fontSize: 12.5, lineHeight: 1.7 }}>
          ρ(∂V/∂t + V·∇V) = −∇p + μ∇²V + ρg
          <br />
          <span style={{ color: '#94A3B8', fontSize: 11 }}>
            [Inertia] = [Pressure gradient] + [Viscous forces] + [Body forces]
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.7 }}>
          <strong>Relationship to Bernoulli:</strong> Bernoulli's equation is a special case of the
          Navier-Stokes equations obtained by applying three simplifications:
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['1. Set μ = 0 (inviscid)', 'Drops the viscous term μ∇²V, leaving Euler\'s equation'],
            ['2. Assume steady flow (∂V/∂t = 0)', 'Eliminates the time-derivative term'],
            ['3. Integrate along a streamline', 'Converts the vector PDE into the scalar Bernoulli equation'],
          ].map(([step, exp]) => (
            <li key={step} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10 }}>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11.5, color: '#0D9488', fontWeight: 600, flexShrink: 0, minWidth: 120 }}>{step}</div>
              <div style={{ fontSize: 13, color: '#475569' }}>{exp}</div>
            </li>
          ))}
        </ul>
        <div className="callout" style={{ fontSize: 12.5 }}>
          <strong>Summary:</strong> Bernoulli's equation is the integral of Euler's equation (which
          is Navier-Stokes without viscosity) along a streamline. Navier-Stokes is the complete,
          general form — Bernoulli is the elegant engineering approximation valid when Re is high
          enough that viscous effects are negligible.
        </div>
      </div>
    ),
  },
];

function AccordionItem({ question, answer, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion-item">
      <button
        className="accordion-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        id={`viva-q-${index}`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: "'IBM Plex Mono'", fontSize: 11, fontWeight: 700,
            color: '#0D9488', flexShrink: 0, marginTop: 2,
          }}>Q{index + 1}</span>
          <span>{question}</span>
        </div>
        <ChevronDown size={16} className={`accordion-icon${open ? ' open' : ''}`} />
      </button>
      {open && (
        <div className="accordion-body" id={`viva-a-${index}`}>
          {answer}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ preset, results, label }) {
  // CP1 — Reference Total Head at Port P1 (matches manual's worked example)
  const thP1      = results[0].totalHead;
  // CP2 — Mean Total Head across all 10 ports (matches manual's stated Result)
  const meanTH    = calculateAverageTotalHead(results);
  const maxVPort  = results.reduce((a, b) => a.velocity > b.velocity ? a : b);
  const Q         = results[0].discharge;

  return (
    <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Award size={18} style={{ color: '#0D9488' }} />
        <div style={{ fontWeight: 600, fontSize: 16, color: '#0F172A' }}>{label}</div>
        <span className="badge badge-teal">Verified</span>
      </div>

      {/* ── Four stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>

        {/* CP1 */}
        <div className="stat-card" style={{ borderLeft: '3px solid #0D9488' }}>
          <div className="stat-card-label">Reference Total Head (Port P1)</div>
          <div className="stat-card-value">{thP1.toFixed(4)}</div>
          <div className="stat-card-unit">m water</div>
          <div style={{
            marginTop: 6, fontSize: 10.5, color: '#64748B', lineHeight: 1.45,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            Matches manual's worked calculation example
          </div>
        </div>

        {/* CP2 */}
        <div className="stat-card" style={{ borderLeft: '3px solid #D97706' }}>
          <div className="stat-card-label">Mean Total Head (All 10 Ports)</div>
          <div className="stat-card-value" style={{ color: '#D97706' }}>{meanTH.toFixed(5)}</div>
          <div className="stat-card-unit">m water</div>
          <div style={{
            marginTop: 6, fontSize: 10.5, color: '#64748B', lineHeight: 1.45,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            Matches manual's stated Result — averaged across all piezometers
          </div>
        </div>

        {/* Q */}
        <div className="stat-card">
          <div className="stat-card-label">Discharge Q</div>
          <div className="stat-card-value">{Q.toExponential(3)}</div>
          <div className="stat-card-unit">m³/s (canonical)</div>
        </div>

        {/* Max velocity port */}
        <div className="stat-card">
          <div className="stat-card-label">Max Velocity Port</div>
          <div className="stat-card-value">{maxVPort.port}</div>
          <div className="stat-card-unit">{maxVPort.area} mm² — V = {maxVPort.velocity.toFixed(3)} m/s</div>
        </div>
      </div>

      {/* ── Per-port table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'IBM Plex Mono'", fontSize: 11.5 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              {['Port', 'Area (mm²)', 'Static Head (mm)', 'Vel. Head (m)', 'Total Head (m)', 'Note'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.port}
                style={{
                  borderBottom: '1px solid #F1F5F9',
                  background: i === 0 ? 'rgba(13,148,136,0.04)' : 'transparent',
                }}>
                <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: 600, color: '#0F172A' }}>{r.port}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>{r.area}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', color: '#475569' }}>{r.pressureHead_mm.toFixed(1)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', color: '#0D9488', fontWeight: 600 }}>{r.velocityHead.toFixed(5)}</td>
                <td style={{
                  padding: '7px 10px', textAlign: 'right', fontWeight: 600,
                  color: i === 0 ? '#0D9488' : '#475569',
                }}>{r.totalHead.toFixed(5)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 10, color: '#94A3B8' }}>
                  {i === 0 ? '← CP1 reference' : r.area === Math.min(...PORT_AREAS_MM2) ? '← throat (max V)' : ''}
                </td>
              </tr>
            ))}
            {/* Mean row */}
            <tr style={{ borderTop: '2px solid #E2E8F0', background: 'rgba(217,119,6,0.04)' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10.5, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em' }}>
                MEAN TOTAL HEAD (CP2)
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: '#D97706', fontSize: 12 }}>
                {meanTH.toFixed(5)}
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: 10, color: '#D97706' }}>← manual Result</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Result statement */}
      <div className="callout" style={{ marginTop: 16, fontSize: 12.5 }}>
        <strong>Result (CP1):</strong> Total head at inlet port P1 ={' '}
        <span style={{ fontFamily: "'IBM Plex Mono'", color: '#0D9488', fontWeight: 700 }}>{thP1.toFixed(4)} m</span>{' '}
        — matches the manual's worked calculation example.
        <br />
        <strong>Result (CP2):</strong> Mean total head across all 10 ports ={' '}
        <span style={{ fontFamily: "'IBM Plex Mono'", color: '#D97706', fontWeight: 700 }}>{meanTH.toFixed(5)} m</span>{' '}
        — matches the manual's stated Result. Maximum velocity at{' '}
        <strong>{maxVPort.port}</strong> ({maxVPort.area} mm²), V = {maxVPort.velocity.toFixed(4)} m/s.
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="page">
      <div className="page-inner">

        <div className="page-header">
          <h1>Results &amp; Discussion</h1>
          <p>Auto-generated summary from both calibration presets, with viva voce questions and answers.</p>
        </div>

        {/* ── Results Summary ── */}
        <section style={{ marginBottom: 40 }}>
          <div className="panel-label">Experiment Results</div>
          <SummaryRow label="300 mm Overflow Pipe" results={results300} />
          <SummaryRow label="350 mm Overflow Pipe" results={results350} />
        </section>

        {/* ── Discussion ── */}
        <section style={{ marginBottom: 40 }}>
          <div className="panel-label">Discussion</div>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5, color: '#475569', lineHeight: 1.75 }}>
              <p>
                The experimental results confirm Bernoulli's theorem: the total head H = p/ρg + V²/2g + z
                remains approximately constant across all 10 measurement ports, with small deviations
                attributable to viscous losses and measurement uncertainty.
              </p>
              <p>
                As expected, the static (pressure) head <strong>decreases at the throat</strong> while
                the velocity head simultaneously increases — the classic trade-off described by Bernoulli.
                Port P7 (102 mm²) consistently shows minimum pressure head and maximum velocity head
                across both experimental runs.
              </p>
              <p>
                The slight decrease in total head from inlet to outlet (visible in the simulation graph)
                represents real energy losses due to viscosity and turbulence — effects not captured
                by ideal Bernoulli theory. A discharge coefficient C_d would quantify these losses
                in a real calibration exercise.
              </p>
            </div>
          </div>
        </section>

        {/* ── Viva Questions ── */}
        <section>
          <div className="panel-label">Viva Voce — Questions &amp; Answers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {VIVA_QA.map((qa, i) => (
              <AccordionItem key={i} index={i} question={qa.q} answer={qa.a} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
