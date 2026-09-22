import { useParams, Link } from 'react-router-dom';
import { getExperiment } from '../config/experiments';

export default function ExperimentTheoryPage() {
  const { slug } = useParams(); const experiment = getExperiment(slug);
  if (!experiment) return <div className="page"><div className="page-inner"><h1>Experiment not found</h1></div></div>;
  return <div className="page"><div className="page-inner"><div className="page-header"><h1>{experiment.title}</h1><p>{experiment.aim}</p></div>
    <section className="card experiment-section"><div className="panel-label">Formulae</div>{experiment.theory.formulae.map((formula) => <div className="equation" key={formula}>{formula}</div>)}</section>
    <section className="card experiment-section"><div className="panel-label">Assumptions</div><div className="info-list">{experiment.theory.assumptions.map((item) => <div className="info-list-row" key={item}>{item}</div>)}</div></section>
    <Link className="btn btn-primary" to={`/experiments/${slug}/simulation`}>Open simulation</Link>
  </div></div>;
}
