import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExperiment } from '../config/experiments';

function buildInputs(experiment) {
  const d = experiment.defaults || {};
  if (experiment.slug === 'orifice') return { diameter_mm: d.diameter_mm, runs: experiment.presets };
  if (experiment.slug === 'notch') return { ...d, runs: experiment.presets };
  if (experiment.slug === 'venturi-orifice') return { ...d, runs: experiment.presets };
  if (experiment.slug === 'major-losses') return { ...d, runs: experiment.presets };
  if (experiment.slug === 'minor-losses') return { ...d, runs: experiment.presets[d.fitting] };
  return null;
}

export default function ExperimentResultsPage() {
  const { slug } = useParams(); const experiment = getExperiment(slug);
  const result = useMemo(() => experiment?.calc ? experiment.calc.runFullSimulation(buildInputs(experiment)) : null, [experiment]);
  if (!experiment) return <div className="page"><div className="page-inner"><h1>Experiment not found</h1></div></div>;
  return <div className="page"><div className="page-inner"><div className="page-header"><h1>{experiment.title}: Results</h1><p>Calculated summary from the calibrated default dataset.</p></div>
    {result ? <><div className="stat-grid generic-stat-grid"><div className="stat-card"><div className="stat-card-label">Primary coefficient</div><div className="stat-card-value">{(result.summary.Cd ?? result.summary.f ?? result.summary.K).toFixed(4)}</div><div className="stat-card-unit">{result.summary.Cd != null ? 'Cd' : result.summary.f != null ? 'friction factor f' : 'loss coefficient K'}</div></div></div><div className="card experiment-section"><div className="panel-label">Observation Table</div><div className="data-table-wrap"><table className="data-table"><thead><tr>{Object.keys(result.table[0]).filter((key) => !['id'].includes(key)).map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{result.table.map((row) => <tr key={row.id}>{Object.keys(row).filter((key) => key !== 'id').map((key) => <td key={key}>{typeof row[key] === 'number' ? row[key].toPrecision(5) : row[key]}</td>)}</tr>)}</tbody></table></div></div></> : <div className="callout">Bernoulli results remain available in the original Results page.</div>}
    <div className="callout"><strong>Data source note:</strong> {experiment.dataNote}</div><Link className="btn btn-primary" to={`/experiments/${slug}/simulation`}>Adjust inputs</Link>
  </div></div>;
}
