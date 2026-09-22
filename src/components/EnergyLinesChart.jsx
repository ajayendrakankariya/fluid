import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';

const CHART_STYLE = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '10px 14px',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color: '#E2E8F0',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#94A3B8' }}>Port {label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#94A3B8' }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 600 }}>{Number(p.value).toFixed(4)} m</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Hydraulic grade line (pressure + datum) and total energy line,
 * plus velocity head — the classic Bernoulli energy diagram.
 */
export default function EnergyLinesChart({ results }) {
  if (!results?.length) return null;

  const data = results.map((r) => {
    const hgl = r.pressureHead + r.deliveryHead;
    return {
      name: r.port,
      'Pressure Head': parseFloat(r.pressureHead.toFixed(5)),
      'Velocity Head': parseFloat(r.velocityHead.toFixed(5)),
      HGL: parseFloat(hgl.toFixed(5)),
      TEL: parseFloat(r.totalHead.toFixed(5)),
    };
  });

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 24, left: 10, bottom: 10 }} style={CHART_STYLE}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <ReferenceArea
            x1="P5"
            x2="P7"
            fill="#F59E0B"
            fillOpacity={0.08}
            stroke="#F59E0B"
            strokeOpacity={0.3}
            strokeDasharray="4 2"
            label={{
              value: 'Throat',
              position: 'insideTop',
              fontSize: 10,
              fill: '#D97706',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(3)}
            label={{
              value: 'Head (m)',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              fontSize: 10,
              fill: '#94A3B8',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="TEL"
            name="Total Energy Line"
            stroke="#0D9488"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#0D9488' }}
            isAnimationActive
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="HGL"
            name="Hydraulic Grade Line"
            stroke="#6366F1"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: '#6366F1' }}
            isAnimationActive
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="Pressure Head"
            stroke="#0EA5E9"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="Velocity Head"
            stroke="#F59E0B"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="callout" style={{ marginTop: 12, fontSize: 12 }}>
        <strong>Reading the energy diagram:</strong> The Total Energy Line (TEL) is nearly flat if
        Bernoulli holds. The Hydraulic Grade Line (HGL) dips at the throat where pressure falls.
        The vertical gap between TEL and HGL equals the velocity head — largest at the narrowest
        section.
      </div>
    </div>
  );
}
