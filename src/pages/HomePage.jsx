import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { EXPERIMENT_LIST } from '../config/experiments';

export default function HomePage() {
  return <div className="page"><div className="page-inner">
    <div className="page-header"><h1>Fluid Mechanics Virtual Lab</h1><p>Six experiments for measurement, energy, and pipe-flow analysis.</p></div>
    <div className="experiment-grid">
      {EXPERIMENT_LIST.map((experiment) => <Link className="card experiment-card" onClick={() => localStorage.setItem('lastExperiment', experiment.slug)} to={`/experiments/${experiment.slug}/simulation`} key={experiment.slug}>
        <div className="experiment-card-top"><span className="badge badge-teal">Experiment {experiment.manualExperimentNo}</span><FlaskConical size={18} /></div>
        <h2>{experiment.title}</h2><p>{experiment.aim}</p><div className="experiment-card-link">Open simulation <ArrowRight size={15} /></div>
      </Link>)}
    </div>
  </div></div>;
}
