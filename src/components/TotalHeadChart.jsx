import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { calculateAverageTotalHead } from '../physics/bernoulli';

const CHART_STYLE = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#1E293B',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11,
      color: '#E2E8F0',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#94A3B8' }}>
        Port {label}
      </div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#94A3B8' }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 600 }}>{Number(p.value).toFixed(4)} m</span>
        </div>
      ))}
    </div>
  );
}

export default function TotalHeadChart({ results }) {
  if (!results || results.length === 0) return null;

  const avgHead = calculateAverageTotalHead(results);

  const data = results.map((r) => ({
    name: r.port,
    Actual: parseFloat(r.totalHead.toFixed(5)),
    Theoretical: parseFloat(avgHead.toFixed(5)),
  }));

  // Throat region is approximately P5–P7
  const throatStart = 'P5';
  const throatEnd = 'P7';

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 20, right: 24, left: 10, bottom: 10 }} style={CHART_STYLE}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />

          {/* Throat region highlight */}
          <ReferenceArea
            x1={throatStart}
            x2={throatEnd}
            fill="#F59E0B"
            fillOpacity={0.08}
            stroke="#F59E0B"
            strokeOpacity={0.3}
            strokeDasharray="4 2"
            label={{ value: 'Throat', position: 'insideTop', fontSize: 10, fill: '#D97706', fontFamily: "'IBM Plex Sans', sans-serif" }}
          />

          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
            label={{ value: 'Port Position →', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#94A3B8', fontFamily: "'IBM Plex Sans', sans-serif" }}
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(3)}`}
            label={{ value: 'Total Head (m)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 10, fill: '#94A3B8', fontFamily: "'IBM Plex Sans', sans-serif" }}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}
          />

          {/* Theoretical flat line */}
          <Line
            type="monotone"
            dataKey="Theoretical"
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            dot={false}
            activeDot={false}
            isAnimationActive={true}
            animationDuration={800}
          />

          {/* Actual computed line */}
          <Line
            type="monotone"
            dataKey="Actual"
            stroke="#0D9488"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#0D9488', stroke: '#14B8A6', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Callout explaining the dip */}
      <div className="callout" style={{ marginTop: 12, fontSize: 12 }}>
        <strong>Why does the actual line dip at the throat?</strong> As the fluid accelerates through the
        narrowing throat, kinetic energy increases — but <em>friction losses and turbulence</em> in
        the converging-diverging section mean that total mechanical energy decreases slightly. The
        gap between the theoretical (flat) line and the actual line represents these irreversible
        losses. This is why real venturimeters use a discharge coefficient C<sub>d</sub> &lt; 1.
      </div>
    </div>
  );
}
