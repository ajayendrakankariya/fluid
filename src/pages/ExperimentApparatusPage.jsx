import { useParams } from 'react-router-dom';
import { getExperiment } from '../config/experiments';

export default function ExperimentApparatusPage() {
  const { slug } = useParams(); const experiment = getExperiment(slug);
  if (!experiment) return <div className="page"><div className="page-inner"><h1>Experiment not found</h1></div></div>;
  return <div className="page"><div className="page-inner"><div className="page-header"><h1>{experiment.title}: Apparatus</h1><p>Equipment used for Experiment {experiment.manualExperimentNo}.</p></div><div className="card apparatus-panel"><div className="panel-label">Apparatus Reference</div>{experiment.apparatus.items.map((item, index) => <div className="apparatus-item" key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><em>{experiment.apparatus.svgKey} setup</em></div>)}</div><div className="callout"><strong>Data source note:</strong> {experiment.dataNote}</div></div></div>;
}
