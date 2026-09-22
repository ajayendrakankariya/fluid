import { useState, useCallback, useEffect } from 'react';
import { Play, RotateCcw, Info } from 'lucide-react';
import {
  runFullSimulation,
  calculateDischarge,
  calculateAverageTotalHead,
  PORT_LABELS,
  TANK_AREA,
} from '../physics/bernoulli';
import { PRESET_300MM, PRESET_350MM, DEFAULT_CUSTOM } from '../data/presets';
import VenturiSVG from './VenturiSVG';
import ResultsTable from './ResultsTable';
import TotalHeadChart from './TotalHeadChart';
import EnergyLinesChart from './EnergyLinesChart';
import InfoTooltip from './InfoTooltip';

const PRESETS = {
  '300mm': PRESET_300MM,
  '350mm': PRESET_350MM,
  custom: DEFAULT_CUSTOM,
};

function StatCard({ label, value, unit, tip }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">
        {tip ? <InfoTooltip tip={tip}>{label}</InfoTooltip> : label}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-unit">{unit}</div>
    </div>
  );
}

export default function SimulationPage() {
  const [preset, setPreset] = useState('300mm');
  const [deliveryHead, setDeliveryHead] = useState(PRESET_300MM.deliveryHead_mm);
  const [timeForRise, setTimeForRise] = useState(PRESET_300MM.time_s);
  const [portReadings, setPortReadings] = useState([...PRESET_300MM.pressureReadings_mm]);
  const [flowSpeedFactor, setFlowSpeedFactor] = useState(1);
  const [diameterScale, setDiameterScale] = useState(1);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [chartTab, setChartTab] = useState('energy');

  const applyPreset = useCallback((key) => {
    const p = PRESETS[key];
    setDeliveryHead(p.deliveryHead_mm);
    setTimeForRise(p.time_s);
    setPortReadings([...p.pressureReadings_mm]);
    setFlowSpeedFactor(1);
    setDiameterScale(1);
  }, []);

  const computeResults = useCallback(() => {
    const activePreset = preset !== 'custom' ? PRESETS[preset] : null;
    const Q_override = activePreset?.Q_m3s ?? null;
    return runFullSimulation(
      deliveryHead,
      portReadings,
      timeForRise,
      0.10,
      Q_override,
      { flowSpeedFactor, diameterScale },
    );
  }, [preset, deliveryHead, portReadings, timeForRise, flowSpeedFactor, diameterScale]);

  // Live recalculation whenever inputs change
  useEffect(() => {
    setResults(computeResults());
    setIsRunning(true);
  }, [computeResults]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 7000);
    return () => clearTimeout(t);
  }, []);

  const handlePresetChange = (e) => {
    const key = e.target.value;
    setPreset(key);
    applyPreset(key);
  };

  const handleRun = () => {
    setResults(computeResults());
    setIsRunning(true);
  };

  const handleReset = () => {
    applyPreset(preset);
  };

  const markCustom = () => {
    if (preset !== 'custom') setPreset('custom');
  };

  const updatePortReading = (i, val) => {
    const updated = [...portReadings];
    updated[i] = parseFloat(val) || 0;
    setPortReadings(updated);
    markCustom();
  };

  const Q = results ? results[0].discharge : calculateDischarge(TANK_AREA, 0.10, timeForRise);
  const avgHead = results ? calculateAverageTotalHead(results) : null;
  const maxVPort = results ? results.reduce((a, b) => (a.velocity > b.velocity ? a : b)) : null;

  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1>Venturimeter Simulation</h1>
              <p>Experiment 8 — Verification of Bernoulli&apos;s Theorem using a Venturimeter</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`badge ${isRunning ? 'badge-teal' : 'badge-navy'}`}>
                {isRunning ? '● Live' : '○ Idle'}
              </span>
              <span className="badge badge-navy">Fluid Mechanics Lab</span>
            </div>
          </div>
        </div>

        {showHint && (
          <div className="callout" style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Info size={15} style={{ color: '#0D9488', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>How to explore:</strong> Particles speed up at the throat. Piezometer columns show
              total head at each port. Choose a calibration preset, or adjust fluid speed and tube
              diameter — the table and graphs update live. Ask the lab assistant (bottom-right) for
              viva-style help.
            </div>
          </div>
        )}

        <div className="sim-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: '20px 16px 16px' }}>
              <div className="panel-label">Venturimeter Cross-Section</div>
              <VenturiSVG
                results={results}
                isRunning={isRunning}
                flowSpeedFactor={flowSpeedFactor}
                diameterScale={diameterScale}
              />
            </div>

            {results && (
              <div className="stat-grid">
                <StatCard
                  label="Discharge Q"
                  value={Q.toExponential(3)}
                  unit="m³/s"
                  tip="Volumetric flow rate. Presets use canonical Q; custom mode uses Q = A·H/t. Flow-speed slider multiplies Q."
                />
                <StatCard
                  label="Avg Total Head"
                  value={avgHead ? avgHead.toFixed(4) : '—'}
                  unit="m water"
                  tip="Mean total head across all 10 ports. Ideal Bernoulli flow would keep this constant."
                />
                <StatCard
                  label="Max Velocity"
                  value={maxVPort ? maxVPort.velocity.toFixed(3) : '—'}
                  unit="m/s"
                  tip={`Peak velocity at the smallest section — currently ${maxVPort?.port} (${maxVPort?.area.toFixed(0)} mm²).`}
                />
                <StatCard
                  label="Throat Port"
                  value={maxVPort?.port ?? '—'}
                  unit={`Area: ${maxVPort ? maxVPort.area.toFixed(0) : '—'} mm²`}
                  tip="Port with the smallest cross-section: highest velocity, lowest static pressure."
                />
              </div>
            )}

            <div className="card" style={{ padding: '20px 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div className="panel-label" style={{ marginBottom: 0 }}>Pressure &amp; Energy Lines</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className={`btn btn-secondary${chartTab === 'energy' ? ' chart-tab-active' : ''}`}
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => setChartTab('energy')}
                  >
                    HGL / TEL
                  </button>
                  <button
                    type="button"
                    className={`btn btn-secondary${chartTab === 'total' ? ' chart-tab-active' : ''}`}
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => setChartTab('total')}
                  >
                    Total Head
                  </button>
                </div>
              </div>
              {results ? (
                chartTab === 'energy' ? (
                  <EnergyLinesChart results={results} />
                ) : (
                  <TotalHeadChart results={results} />
                )
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
                  Adjust parameters to see live graphs
                </div>
              )}
            </div>

            <div className="card" style={{ padding: '20px 16px 16px' }}>
              <div className="panel-label">Observation Table</div>
              {results ? (
                <ResultsTable results={results} />
              ) : (
                <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
                  Waiting for simulation data…
                </div>
              )}
            </div>
          </div>

          <div className="sim-controls">
            <div className="card" style={{ padding: 20 }}>
              <div className="panel-label">Experiment Preset</div>
              <div className="form-control">
                <label className="form-label" htmlFor="preset-select">Overflow Pipe Configuration</label>
                <select
                  id="preset-select"
                  className="form-select"
                  value={preset}
                  onChange={handlePresetChange}
                >
                  <option value="300mm">300 mm Overflow Pipe</option>
                  <option value="350mm">350 mm Overflow Pipe</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="panel-label">Interactive Flow Controls</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-control">
                  <label className="form-label" htmlFor="flow-speed">
                    <InfoTooltip tip="Scales volumetric discharge Q. Particles and velocity heads update in real time. Reset via a calibration preset.">
                      Fluid Speed Factor ×{flowSpeedFactor.toFixed(2)}
                    </InfoTooltip>
                  </label>
                  <input
                    id="flow-speed"
                    type="range"
                    className="form-slider"
                    min={0.4}
                    max={2}
                    step={0.05}
                    value={flowSpeedFactor}
                    onChange={(e) => {
                      setFlowSpeedFactor(parseFloat(e.target.value));
                      markCustom();
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="form-label" htmlFor="diameter-scale">
                    <InfoTooltip tip="Linear scale on tube diameter. Cross-sectional areas scale with d², so velocity V = Q/A changes accordingly.">
                      Tube Diameter Scale ×{diameterScale.toFixed(2)}
                    </InfoTooltip>
                  </label>
                  <input
                    id="diameter-scale"
                    type="range"
                    className="form-slider"
                    min={0.7}
                    max={1.35}
                    step={0.01}
                    value={diameterScale}
                    onChange={(e) => {
                      setDiameterScale(parseFloat(e.target.value));
                      markCustom();
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="panel-label">Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-control">
                  <label className="form-label" htmlFor="delivery-head">
                    <InfoTooltip tip="Overflow / balancing head sets the datum pressure reference (mm of water).">
                      Delivery / Balancing Head (mm)
                    </InfoTooltip>
                  </label>
                  <input
                    id="delivery-head"
                    type="number"
                    className="form-input"
                    value={deliveryHead}
                    min={50}
                    max={600}
                    step={0.1}
                    onChange={(e) => {
                      setDeliveryHead(parseFloat(e.target.value) || 0);
                      markCustom();
                    }}
                  />
                  <input
                    type="range"
                    className="form-slider"
                    min={50}
                    max={600}
                    step={1}
                    value={deliveryHead}
                    onChange={(e) => {
                      setDeliveryHead(parseFloat(e.target.value));
                      markCustom();
                    }}
                    style={{ marginTop: 6 }}
                  />
                </div>

                <div className="form-control">
                  <label className="form-label" htmlFor="time-rise">
                    <InfoTooltip tip="Time for 10 cm rise in the collecting tank. Used for Q = A·H/t in custom mode.">
                      Time for 10 cm Rise (s)
                    </InfoTooltip>
                  </label>
                  <input
                    id="time-rise"
                    type="number"
                    className="form-input"
                    value={timeForRise}
                    min={5}
                    max={120}
                    step={0.1}
                    onChange={(e) => {
                      setTimeForRise(parseFloat(e.target.value) || 1);
                      markCustom();
                    }}
                  />
                  <input
                    type="range"
                    className="form-slider"
                    min={5}
                    max={120}
                    step={0.5}
                    value={timeForRise}
                    onChange={(e) => {
                      setTimeForRise(parseFloat(e.target.value));
                      markCustom();
                    }}
                    style={{ marginTop: 6 }}
                  />
                </div>

                {(() => {
                  const activePreset = preset !== 'custom' ? PRESETS[preset] : null;
                  const displayQ =
                    (activePreset?.Q_m3s ?? calculateDischarge(TANK_AREA, 0.10, timeForRise)) *
                    flowSpeedFactor;
                  const isCanonical = !!activePreset?.Q_m3s && flowSpeedFactor === 1 && diameterScale === 1;
                  return (
                    <div
                      style={{
                        background: 'rgba(13,148,136,0.06)',
                        border: '1px solid rgba(13,148,136,0.20)',
                        borderRadius: 8,
                        padding: '10px 14px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#94A3B8',
                          marginBottom: 4,
                        }}
                      >
                        {isCanonical ? 'Canonical Q (preset)' : 'Live Q'}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 17, fontWeight: 600, color: '#0D9488' }}>
                        {displayQ.toExponential(4)}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: '#64748B' }}>
                        m³/s{isCanonical ? ' — manual-verified' : ''}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {preset === 'custom' && (
              <div className="card" style={{ padding: 20 }}>
                <div className="panel-label">
                  <InfoTooltip tip="Piezometer readings (mm water) for ports P1–P10.">
                    Pressure Port Readings (mm)
                  </InfoTooltip>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {PORT_LABELS.map((label, i) => (
                    <div className="form-control" key={label}>
                      <label className="form-label" htmlFor={`port-${label}`}>
                        {label}
                      </label>
                      <input
                        id={`port-${label}`}
                        type="number"
                        className="form-input"
                        value={portReadings[i]}
                        min={0}
                        max={1000}
                        step={1}
                        onChange={(e) => updatePortReading(i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button id="btn-run-simulation" className="btn btn-primary" onClick={handleRun} style={{ flex: 1 }}>
                <Play size={14} />
                Refresh Simulation
              </button>
              <button id="btn-reset" className="btn btn-secondary" onClick={handleReset} title="Reset to preset defaults">
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div className="panel-label">Apparatus Constants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Tank area (A_T)', '0.0405 m²'],
                  ['Rise height (H)', '0.10 m'],
                  ['g', '9.81 m/s²'],
                  ['Ports', 'P1–P10'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748B' }}>{k}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 600, color: '#334155' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
