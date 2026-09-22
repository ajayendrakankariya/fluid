import InfoTooltip from './InfoTooltip';

const COLUMNS = [
  {
    key: 'port',
    label: 'Port',
    tip: null,
    format: (v) => v,
    live: false,
    center: true,
  },
  {
    key: 'area',
    label: 'Area (mm²)',
    tip: 'Cross-sectional area of the venturi pipe at this measurement port. Smallest at the throat (P7: 102 mm²).',
    format: (v) => v.toFixed(0),
    live: false,
  },
  {
    key: 'pressureHead_mm',
    label: 'Static Head (mm)',
    tip: 'Piezometric (static) pressure head h = p/ρg, measured by the manometer tube height. Drops at the throat per Bernoulli.',
    format: (v) => v.toFixed(1),
    live: false,
  },
  {
    key: 'velocity',
    label: 'Velocity (m/s)',
    tip: 'Flow velocity V = Q/A at this port. Peaks at the narrowest throat section by continuity.',
    format: (v) => v.toFixed(4),
    live: true,
  },
  {
    key: 'velocityHead',
    label: 'Vel. Head (m)',
    tip: 'Kinetic energy head = V²/2g. Represents kinetic energy per unit weight of fluid. Peaks at the throat.',
    format: (v) => v.toFixed(4),
    live: true,
  },
  {
    key: 'totalHead',
    label: 'Total Head (m)',
    tip: 'Total energy head H = p/ρg + V²/2g + z. Should remain approximately constant (Bernoulli). Slight decrease along pipe due to friction losses.',
    format: (v) => v.toFixed(4),
    live: true,
  },
];

export default function ResultsTable({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="data-table-wrap">
      <table className="data-table" aria-label="Simulation results table">
        <thead>
          <tr>
            {COLUMNS.map(({ key, label, tip }) => (
              <th key={key}>
                {tip ? (
                  <InfoTooltip tip={tip}>{label}</InfoTooltip>
                ) : label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={row.port}>
              {COLUMNS.map(({ key, format, live, center }) => (
                <td
                  key={key}
                  className={live ? 'cell-live' : ''}
                  style={center ? { textAlign: 'center' } : {}}
                >
                  {format(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
