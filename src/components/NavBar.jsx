import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Cpu, BarChart2, FlaskConical } from 'lucide-react';
import { EXPERIMENT_LIST } from '../config/experiments';

const links = [
  { to: '/theory', label: 'Theory', Icon: BookOpen },
  { to: '/apparatus', label: 'Apparatus', Icon: Cpu },
  { to: '/simulation', label: 'Simulation', Icon: FlaskConical },
  { to: '/results', label: 'Results', Icon: BarChart2 },
];

export default function NavBar() {
  const location = useLocation();
  const match = location.pathname.match(/^\/experiments\/([^/]+)/);
  const currentSlug = match?.[1] ?? 'bernoulli';
  const currentExperiment = EXPERIMENT_LIST.find((experiment) => experiment.slug === currentSlug) ?? EXPERIMENT_LIST[3];
  const experimentBase = `/experiments/${currentExperiment.slug}`;

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="nav-brand-badge">Exp {currentExperiment.manualExperimentNo}</span>
          <span>Fluid Mechanics Virtual Lab</span>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink to="/experiments" className="nav-link">Experiments</NavLink>
          </li>
          {links.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={`${experimentBase}${to}`}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Icon size={14} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
