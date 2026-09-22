import { useState } from 'react';

const COMPONENT_TIPS = {
  supply:      'Supply / Overhead Tank. Maintains a constant head via an overflow pipe so flow into the venturimeter is steady. The fixed water level satisfies Bernoulli\'s steady-flow assumption.',
  pump:        'Centrifugal Pump. Lifts water from the sump to the overhead supply tank, providing the energy to drive continuous flow. The pump head appears as potential energy at the inlet.',
  inlet_valve: 'Inlet Control Valve. Throttles the flow entering the venturimeter. Partial closure raises delivery head and reduces Q; fully open gives maximum discharge.',
  venturi:     'Venturimeter. A converging–throat–diverging pipe with 10 pressure taps. At the narrow throat, velocity peaks and static pressure drops — the principle used to measure Q.',
  piezometer:  'Piezometer / Manometer Bank. Ten vertical glass tubes (P1–P10) connected to the pressure taps. Water levels directly read the static head at each port.',
  collecting:  'Collecting Tank (A_T = 0.0405 m²). Discharge is measured by timing a 10 cm rise: Q = A_T × 0.10 / t. This bypasses any assumption about the venturimeter coefficient.',
  drain_valve: 'Drain Valve. Closed during measurement so water accumulates. Opened between readings to drain the collecting tank back to the sump.',
  overflow:    'Overflow Pipe. Sets the constant delivery head. Two pipe lengths are tested (300 mm and 350 mm); a longer pipe raises the supply level and increases Q.',
  sump:        'Sump Tank. Lower reservoir from which the pump draws. All return water collects here to complete the closed loop.',
};

function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 5 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={{
        width: 15, height: 15, borderRadius: '50%',
        background: '#CBD5E1', color: '#64748B',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, cursor: 'help', lineHeight: 1, flexShrink: 0,
      }}>i</span>
      {open && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#1E293B', color: 'rgba(255,255,255,0.9)',
          borderRadius: 8, padding: '10px 13px',
          fontSize: 12, lineHeight: 1.55, width: 260,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          pointerEvents: 'none', zIndex: 50,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

/* ─── Flow circuit schematic (clean SVG, proper coordinates) ─── */
function FlowCircuit() {
  // Layout constants — everything defined top-down, left-to-right
  // Column X centres
  const CX_LEFT   = 90;   // Supply tank / pump / sump
  const CX_MID    = 460;  // Venturimeter centre
  const CX_RIGHT  = 790;  // Collecting tank

  // Row Y centres
  const Y_TOP_TANK = 90;  // Supply tank top
  const Y_PIPE     = 210; // Horizontal main pipe
  const Y_BOT_PUMP = 360; // Pump centre
  const Y_SUMP     = 440; // Sump tank centre

  // Tank dimensions
  const SUPPLY_W = 130, SUPPLY_H = 110;
  const COLLECT_W = 130, COLLECT_H = 150;
  const SUMP_W = 130, SUMP_H = 60;

  // Pipe half-width (visual thickness)
  const PW = 6;

  // Supply tank rect coords
  const sX = CX_LEFT - SUPPLY_W / 2;
  const sY = Y_TOP_TANK;
  const sX2 = sX + SUPPLY_W;
  const sY2 = sY + SUPPLY_H;

  // Collecting tank rect coords
  const cX = CX_RIGHT - COLLECT_W / 2;
  const cY = Y_PIPE - 30;
  const cX2 = cX + COLLECT_W;
  const cY2 = cY + COLLECT_H;

  // Sump rect coords
  const smX = CX_LEFT - SUMP_W / 2;
  const smY = Y_SUMP - SUMP_H / 2;

  // Venturimeter shape — proper trapezoid walls
  const VX = CX_MID - 140; // left edge of venturi
  const VW = 280;           // total length
  const VPIPE_TOP = Y_PIPE - 22; // pipe wall top (wide end)
  const VPIPE_BOT = Y_PIPE + 22; // pipe wall bottom (wide end)
  const VTHRT_TOP = Y_PIPE - 9;  // throat top
  const VTHRT_BOT = Y_PIPE + 9;  // throat bottom
  const VTHRT_X   = VX + VW * 0.45; // throat x position

  // Venturi outline path: top wall converging, across throat, diverging, bottom wall diverging, across throat, converging
  const venturiPath = [
    `M ${VX},${VPIPE_TOP}`,               // top-left inlet
    `L ${VTHRT_X},${VTHRT_TOP}`,           // converge top
    `L ${VX + VW},${VPIPE_TOP - 6}`,       // diverge top (slightly narrower than inlet)
    `L ${VX + VW},${VPIPE_BOT + 6}`,       // outlet bottom
    `L ${VTHRT_X},${VTHRT_BOT}`,           // throat bottom
    `L ${VX},${VPIPE_BOT}`,                // inlet bottom
    'Z',
  ].join(' ');

  // Inner fluid path (slightly inset)
  const fluidPath = [
    `M ${VX},${VPIPE_TOP + 3}`,
    `L ${VTHRT_X},${VTHRT_TOP + 2}`,
    `L ${VX + VW},${VPIPE_TOP - 3}`,
    `L ${VX + VW},${VPIPE_BOT + 3}`,
    `L ${VTHRT_X},${VTHRT_BOT - 2}`,
    `L ${VX},${VPIPE_BOT - 3}`,
    'Z',
  ].join(' ');

  // Port tap positions along the venturi top wall
  const portFractions = [0.05, 0.14, 0.24, 0.33, 0.40, 0.48, 0.54, 0.65, 0.76, 0.88];
  const portPoints = portFractions.map(f => {
    const px = VX + f * VW;
    const t = f / 0.45; // normalised convergence
    let topY;
    if (f < 0.45) {
      topY = VPIPE_TOP + (VTHRT_TOP - VPIPE_TOP) * (f / 0.45);
    } else {
      topY = VTHRT_TOP + (VPIPE_TOP - 6 - VTHRT_TOP) * ((f - 0.45) / 0.55);
    }
    return { px, topY };
  });

  // Piezometer tube tops (static decorative heights for schematic)
  const piezoHeights = [52, 47, 40, 31, 24, 36, 20, 43, 48, 51];

  return (
    <svg
      viewBox="0 0 900 530"
      width="100%"
      style={{ display: 'block' }}
      aria-label="Venturimeter flow circuit schematic"
    >
      <defs>
        <linearGradient id="fc-tank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#BFDBFE" />
        </linearGradient>
        <linearGradient id="fc-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="fc-venturi" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1E3A5F" />
          <stop offset="40%"  stopColor="#0F2744" />
          <stop offset="50%"  stopColor="#0D9488" />
          <stop offset="60%"  stopColor="#0F2744" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>
        <linearGradient id="fc-fluid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0EA5E9" stopOpacity="0.4" />
          <stop offset="45%"  stopColor="#14B8A6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.4" />
        </linearGradient>
        <marker id="fc-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M0,1 L8,4.5 L0,8 Z" fill="#0D9488" />
        </marker>
        <marker id="fc-arrow-gray" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M0,1 L8,4.5 L0,8 Z" fill="#94A3B8" />
        </marker>
      </defs>

      {/* ── Background ── */}
      <rect width="900" height="530" fill="#F8FAFC" rx="8" />

      {/* ══════════════════════════════════════════
          PIEZOMETER BANK (top centre area)
          ═══════════════════════════════════════ */}
      <rect x="290" y="30" width="360" height="120" rx="6"
        fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
      <text x="470" y="22" textAnchor="middle" fontSize="9"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#64748B"
        letterSpacing="1.5">PIEZOMETER PANEL</text>

      {/* Piezometer tubes */}
      {portPoints.map(({ px }, i) => {
        const tubeX = 307 + i * 34;
        const h = piezoHeights[i];
        return (
          <g key={i}>
            <rect x={tubeX - 4} y={36} width={8} height={100} rx={3}
              fill="none" stroke="#CBD5E1" strokeWidth="1" />
            <rect x={tubeX - 3} y={36 + (100 - h)} width={6} height={h} rx={2}
              fill="url(#fc-water)" />
            <ellipse cx={tubeX} cy={36 + (100 - h)} rx={4} ry={2}
              fill="#14B8A6" opacity={0.8} />
            <text x={tubeX} y={145} textAnchor="middle" fontSize="7.5"
              fontFamily="IBM Plex Mono" fill="#64748B">P{i + 1}</text>
          </g>
        );
      })}

      {/* Connector lines: piezometer tubes → venturi ports */}
      {portPoints.map(({ px, topY }, i) => {
        const tubeX = 307 + i * 34;
        return (
          <line key={i}
            x1={tubeX} y1={152}
            x2={px}   y2={topY}
            stroke="#CBD5E1" strokeWidth="0.7" strokeDasharray="3 2" />
        );
      })}


      {/* ══════════════════════════════════════════
          SUPPLY TANK (left)
          ═══════════════════════════════════════ */}
      <rect x={sX} y={sY} width={SUPPLY_W} height={SUPPLY_H}
        rx="6" fill="url(#fc-tank)" stroke="#7DD3FC" strokeWidth="1.5" />
      {/* Water level */}
      <rect x={sX + 2} y={sY + SUPPLY_H * 0.55} width={SUPPLY_W - 4}
        height={SUPPLY_H * 0.45 - 2} rx="2" fill="url(#fc-water)" />
      {/* Overflow pipe (small vertical line on right wall) */}
      <rect x={sX2 - 5} y={sY + SUPPLY_H * 0.42} width="6" height={SUPPLY_H * 0.30}
        rx="2" fill="#64748B" />
      <text x={sX2 + 12} y={sY + SUPPLY_H * 0.52} fontSize="8.5"
        fontFamily="IBM Plex Sans" fill="#64748B" fontWeight="600">Overflow</text>
      <text x={sX2 + 12} y={sY + SUPPLY_H * 0.52 + 12} fontSize="7.5"
        fontFamily="IBM Plex Mono" fill="#94A3B8">300 / 350 mm</text>
      {/* Label */}
      <text x={CX_LEFT} y={sY + 20} textAnchor="middle" fontSize="11"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#1E3A5F">Supply Tank</text>
      <text x={CX_LEFT} y={sY + 34} textAnchor="middle" fontSize="9"
        fontFamily="IBM Plex Sans" fill="#64748B">(Overhead)</text>


      {/* ══════════════════════════════════════════
          INLET VALVE
          ═══════════════════════════════════════ */}
      {/* Horizontal pipe: supply tank right → venturi left, at Y_PIPE */}
      <line x1={sX2} y1={Y_PIPE} x2={VX} y2={Y_PIPE}
        stroke="#7DD3FC" strokeWidth={PW * 2} strokeLinecap="round" />
      <line x1={sX2 + 20} y1={Y_PIPE} x2={VX - 8} y2={Y_PIPE}
        stroke="#38BDF8" strokeWidth={PW} markerEnd="url(#fc-arrow)" />

      {/* Valve symbol at midpoint of pipe */}
      {(() => {
        const vx = sX2 + 55;
        const vy = Y_PIPE;
        return (
          <g transform={`translate(${vx},${vy})`}>
            {/* Valve body */}
            <polygon points="-10,-10 10,0 -10,10" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
            <polygon points="10,-10 -10,0 10,10" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#475569" strokeWidth="1.5" />
            {/* Valve stem */}
            <line x1="0" y1="-10" x2="0" y2="-22" stroke="#64748B" strokeWidth="1.5" />
            <rect x="-8" y="-30" width="16" height="7" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
            <text x="18" y="-14" fontSize="9" fontFamily="IBM Plex Sans" fontWeight="600" fill="#334155">Inlet Valve</text>
          </g>
        );
      })()}

      {/* Vertical pipe: supply tank bottom → pipe level */}
      <line x1={CX_LEFT} y1={sY2} x2={CX_LEFT} y2={Y_PIPE}
        stroke="#7DD3FC" strokeWidth={PW * 2} strokeLinecap="round" />
      {/* Elbow corner */}
      <rect x={CX_LEFT - PW} y={Y_PIPE - PW} width={PW * 2 + sX2 - CX_LEFT} height={PW * 2}
        fill="#7DD3FC" />


      {/* ══════════════════════════════════════════
          VENTURIMETER
          ═══════════════════════════════════════ */}
      {/* Pipe wall (outer shape) */}
      <path d={venturiPath} fill="url(#fc-venturi)" stroke="#0F2744" strokeWidth="1.5" />
      {/* Fluid inside */}
      <path d={fluidPath} fill="url(#fc-fluid)" />

      {/* Port tap dots on top wall */}
      {portPoints.map(({ px, topY }, i) => (
        <circle key={i} cx={px} cy={topY} r={2.5}
          fill="#0D9488" stroke="#fff" strokeWidth={1} />
      ))}

      {/* Throat annotation */}
      <line x1={VTHRT_X} y1={VTHRT_TOP - 2} x2={VTHRT_X} y2={Y_PIPE - 55}
        stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
      <text x={VTHRT_X + 4} y={Y_PIPE - 56} fontSize="8.5"
        fontFamily="IBM Plex Mono" fontWeight="700" fill="#D97706">THROAT</text>
      <text x={VTHRT_X + 4} y={Y_PIPE - 44} fontSize="7.5"
        fontFamily="IBM Plex Mono" fill="#D97706">max V, min P</text>

      {/* Venturimeter label */}
      <text x={CX_MID} y={Y_PIPE + 44} textAnchor="middle" fontSize="11"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#1E3A5F">Venturimeter</text>
      <text x={CX_MID} y={Y_PIPE + 57} textAnchor="middle" fontSize="8.5"
        fontFamily="IBM Plex Mono" fill="#64748B">P1–P10 (10 pressure ports)</text>

      {/* Flow direction labels */}
      <text x={VX - 10} y={Y_PIPE + 6} textAnchor="end" fontSize="8"
        fontFamily="IBM Plex Sans" fill="#0D9488" fontWeight="600">→</text>
      <text x={VX + VW + 10} y={Y_PIPE + 6} fontSize="8"
        fontFamily="IBM Plex Sans" fill="#0D9488" fontWeight="600">→</text>


      {/* ══════════════════════════════════════════
          COLLECTING TANK (right)
          ═══════════════════════════════════════ */}
      {/* Pipe: venturi outlet → collecting tank */}
      <line x1={VX + VW} y1={Y_PIPE} x2={cX} y2={Y_PIPE}
        stroke="#7DD3FC" strokeWidth={PW * 2} strokeLinecap="round" />
      <line x1={VX + VW + 10} y1={Y_PIPE} x2={cX - 4} y2={Y_PIPE}
        stroke="#38BDF8" strokeWidth={PW} markerEnd="url(#fc-arrow)" />

      {/* Tank body */}
      <rect x={cX} y={cY} width={COLLECT_W} height={COLLECT_H}
        rx="6" fill="url(#fc-tank)" stroke="#7DD3FC" strokeWidth="1.5" />
      {/* Water in tank */}
      <rect x={cX + 2} y={cY + COLLECT_H * 0.52} width={COLLECT_W - 4}
        height={COLLECT_H * 0.45} rx="2" fill="url(#fc-water)" />

      {/* 10cm rise measurement lines */}
      <line x1={cX + 5} y1={cY + COLLECT_H * 0.52} x2={cX + COLLECT_W - 5} y2={cY + COLLECT_H * 0.52}
        stroke="#0D9488" strokeWidth="1" strokeDasharray="4 2" />
      <line x1={cX + 5} y1={cY + COLLECT_H * 0.67} x2={cX + COLLECT_W - 5} y2={cY + COLLECT_H * 0.67}
        stroke="#0D9488" strokeWidth="1" strokeDasharray="4 2" />
      {/* Brace */}
      <line x1={cX + COLLECT_W + 10} y1={cY + COLLECT_H * 0.52}
            x2={cX + COLLECT_W + 10} y2={cY + COLLECT_H * 0.67}
        stroke="#0D9488" strokeWidth="1.5" />
      <line x1={cX + COLLECT_W + 6}  y1={cY + COLLECT_H * 0.52}
            x2={cX + COLLECT_W + 14} y2={cY + COLLECT_H * 0.52}
        stroke="#0D9488" strokeWidth="1.5" />
      <line x1={cX + COLLECT_W + 6}  y1={cY + COLLECT_H * 0.67}
            x2={cX + COLLECT_W + 14} y2={cY + COLLECT_H * 0.67}
        stroke="#0D9488" strokeWidth="1.5" />
      <text x={cX + COLLECT_W + 18} y={cY + COLLECT_H * 0.61}
        fontSize="8" fontFamily="IBM Plex Mono" fill="#0D9488">10 cm</text>

      {/* Labels */}
      <text x={CX_RIGHT} y={cY + 18} textAnchor="middle" fontSize="11"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#1E3A5F">Collecting Tank</text>
      <text x={CX_RIGHT} y={cY + 32} textAnchor="middle" fontSize="9"
        fontFamily="IBM Plex Mono" fill="#64748B">A_T = 0.0405 m²</text>


      {/* ══════════════════════════════════════════
          DRAIN VALVE (below collecting tank)
          ═══════════════════════════════════════ */}
      {(() => {
        const dvY = cY2 + 30;
        return (
          <g>
            {/* Pipe: tank bottom → drain valve */}
            <line x1={CX_RIGHT} y1={cY2} x2={CX_RIGHT} y2={dvY - 12}
              stroke="#7DD3FC" strokeWidth={PW * 2} strokeLinecap="round" />
            {/* Valve */}
            <g transform={`translate(${CX_RIGHT},${dvY})`}>
              <polygon points="-10,-10 10,0 -10,10" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
              <polygon points="10,-10 -10,0 10,10" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
              <line x1="-14" y1="0" x2="14" y2="0" stroke="#475569" strokeWidth="1.5" />
            </g>
            <text x={CX_RIGHT + 18} y={dvY + 4} fontSize="9"
              fontFamily="IBM Plex Sans" fontWeight="600" fill="#334155">Drain Valve</text>

            {/* Return pipe: drain → sump (dashed) */}
            <path d={`M ${CX_RIGHT},${dvY + 12} L ${CX_RIGHT},${Y_SUMP} L ${CX_LEFT + SUMP_W / 2},${Y_SUMP}`}
              stroke="#94A3B8" strokeWidth="3" strokeDasharray="7 4" fill="none"
              markerEnd="url(#fc-arrow-gray)" />
            <text x={(CX_RIGHT + CX_LEFT) / 2} y={Y_SUMP + 14} textAnchor="middle"
              fontSize="8" fontFamily="IBM Plex Sans" fill="#94A3B8">
              ← return flow (closed loop)
            </text>
          </g>
        );
      })()}


      {/* ══════════════════════════════════════════
          PUMP (left column, below supply)
          ═══════════════════════════════════════ */}
      {/* Pipe: supply tank bottom → pump top */}
      <line x1={CX_LEFT} y1={sY2} x2={CX_LEFT} y2={Y_BOT_PUMP - 28}
        stroke="#7DD3FC" strokeWidth={PW * 2} strokeLinecap="round" />

      {/* Pump circle */}
      <circle cx={CX_LEFT} cy={Y_BOT_PUMP} r={28}
        fill="#F1F5F9" stroke="#64748B" strokeWidth="2" />
      {/* Pump impeller symbol */}
      {[0, 60, 120, 180, 240, 300].map(deg => {
        const rad = deg * Math.PI / 180;
        const x1 = CX_LEFT + Math.cos(rad) * 8;
        const y1 = Y_BOT_PUMP + Math.sin(rad) * 8;
        const x2 = CX_LEFT + Math.cos(rad) * 20;
        const y2 = Y_BOT_PUMP + Math.sin(rad) * 20;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748B" strokeWidth="2" strokeLinecap="round" />;
      })}
      <circle cx={CX_LEFT} cy={Y_BOT_PUMP} r={7} fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
      <text x={CX_LEFT} y={Y_BOT_PUMP + 3} textAnchor="middle" fontSize="6"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#334155">P</text>

      {/* Pump label */}
      <text x={CX_LEFT + 35} y={Y_BOT_PUMP - 6} fontSize="10"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#1E3A5F">Centrifugal</text>
      <text x={CX_LEFT + 35} y={Y_BOT_PUMP + 8} fontSize="10"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#1E3A5F">Pump</text>

      {/* Pipe: pump bottom → sump top (suction) */}
      <line x1={CX_LEFT} y1={Y_BOT_PUMP + 28} x2={CX_LEFT} y2={Y_SUMP - SUMP_H / 2}
        stroke="#7DD3FC" strokeWidth={PW * 2} strokeLinecap="round" />
      {/* Arrow on suction pipe (flow goes up into pump) */}
      <line x1={CX_LEFT} y1={Y_SUMP - SUMP_H / 2 + 4} x2={CX_LEFT} y2={Y_BOT_PUMP + 32}
        stroke="#38BDF8" strokeWidth={PW} markerEnd="url(#fc-arrow)" />


      {/* ══════════════════════════════════════════
          SUMP TANK (bottom left)
          ═══════════════════════════════════════ */}
      <rect x={smX} y={smY} width={SUMP_W} height={SUMP_H}
        rx="6" fill="url(#fc-tank)" stroke="#7DD3FC" strokeWidth="1.5" />
      <rect x={smX + 2} y={smY + SUMP_H * 0.45} width={SUMP_W - 4} height={SUMP_H * 0.52}
        rx="2" fill="url(#fc-water)" />
      <text x={CX_LEFT} y={smY + 18} textAnchor="middle" fontSize="11"
        fontFamily="IBM Plex Sans" fontWeight="700" fill="#1E3A5F">Sump Tank</text>


      {/* ══════════════════════════════════════════
          LEGEND
          ═══════════════════════════════════════ */}
      <g transform="translate(20, 20)">
        <rect x="0" y="0" width="220" height="38" rx="5"
          fill="white" stroke="#E2E8F0" strokeWidth="1" />
        <line x1="10" y1="12" x2="36" y2="12" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
        <text x="44" y="16" fontSize="9.5" fontFamily="IBM Plex Sans" fill="#475569">Supply / delivery flow</text>
        <line x1="10" y1="28" x2="36" y2="28" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="6 3" />
        <text x="44" y="32" fontSize="9.5" fontFamily="IBM Plex Sans" fill="#475569">Return flow (drain)</text>
      </g>

      {/* ══════════════════════════════════════════
          FLOW ARROW LABELS
          ═══════════════════════════════════════ */}
      <text x={sX2 + 40} y={Y_PIPE - 14} fontSize="9" fontFamily="IBM Plex Sans"
        fill="#0D9488" fontWeight="600">Flow →</text>
      <text x={(VX + VW + cX) / 2} y={Y_PIPE - 14} fontSize="9" fontFamily="IBM Plex Sans"
        fill="#0D9488" fontWeight="600">Flow →</text>

    </svg>
  );
}

/* ─── Venturi cross-section detail ─── */
function VenturiDetail() {
  const W = 860, H = 180;
  const CY = 90; // centre y
  const XS = 40, XE = 820;
  const SPAN = XE - XS;

  // Radius profile
  function r(t) {
    const ri = 42, rt = 14, ro = 36;
    if (t < 0.42) return ri + (rt - ri) * Math.pow(t / 0.42, 1.7);
    if (t <= 0.52) return rt + (rt * 0.08) * Math.sin(Math.PI * (t - 0.42) / 0.10);
    return rt + (ro - rt) * Math.pow((t - 0.52) / 0.48, 1.3);
  }

  const steps = 100;
  const top = [], bot = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = XS + t * SPAN;
    top.push([px, CY - r(t)]);
    bot.push([px, CY + r(t)]);
  }

  const toD = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const wallPath = `${toD(top)} ${toD([...bot].reverse())} Z`;
  const fluidPath = `${top.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${(p[1] + 2.5).toFixed(1)}`).join(' ')} ${[...bot].reverse().map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${(p[1] - 2.5).toFixed(1)}`).join(' ')} Z`;

  const ports = [
    { t: 0.05, label: 'P1', area: 491 },
    { t: 0.13, label: 'P2', area: 357 },
    { t: 0.22, label: 'P3', area: 245 },
    { t: 0.31, label: 'P4', area: 153 },
    { t: 0.40, label: 'P5', area: 120 },
    { t: 0.50, label: 'P6', area: 150 },
    { t: 0.55, label: 'P7', area: 102 },
    { t: 0.65, label: 'P8', area: 279 },
    { t: 0.77, label: 'P9', area: 369 },
    { t: 0.89, label: 'P10', area: 471 },
  ];

  const throatT = 0.47;
  const throatX = XS + throatT * SPAN;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}
      aria-label="Venturimeter cross-section showing port positions">
      <defs>
        <linearGradient id="vd-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A5F" />
          <stop offset="50%" stopColor="#0F2744" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>
        <linearGradient id="vd-fluid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0EA5E9" stopOpacity="0.35" />
          <stop offset="45%"  stopColor="#14B8A6" stopOpacity="0.7" />
          <stop offset="55%"  stopColor="#14B8A6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#F8FAFC" />

      {/* Pipe wall */}
      <path d={wallPath} fill="url(#vd-wall)" stroke="#0F2744" strokeWidth="1.5" />
      {/* Fluid */}
      <path d={fluidPath} fill="url(#vd-fluid)" />

      {/* Throat line */}
      <line x1={throatX} y1={CY - r(throatT) - 2} x2={throatX} y2={CY - r(throatT) - 28}
        stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
      <text x={throatX} y={CY - r(throatT) - 32} textAnchor="middle"
        fontSize="8" fontFamily="IBM Plex Mono" fontWeight="700" fill="#D97706">THROAT</text>

      {/* Port markers */}
      {ports.map(({ t, label, area }) => {
        const px = XS + t * SPAN;
        const ry = r(t);
        const dotY = CY - ry;
        return (
          <g key={label}>
            <circle cx={px} cy={dotY} r="3" fill="#0D9488" stroke="#fff" strokeWidth="1" />
            <line x1={px} y1={dotY} x2={px} y2={CY + ry + 14} stroke="#CBD5E1" strokeWidth="0.7" strokeDasharray="2 2" />
            <text x={px} y={CY + ry + 25} textAnchor="middle" fontSize="7.5"
              fontFamily="IBM Plex Mono" fill="#475569" fontWeight="600">{label}</text>
            <text x={px} y={CY + ry + 35} textAnchor="middle" fontSize="6.5"
              fontFamily="IBM Plex Mono" fill="#94A3B8">{area}</text>
          </g>
        );
      })}

      {/* Area unit label */}
      <text x={XS + SPAN / 2} y={H - 4} textAnchor="middle"
        fontSize="7.5" fontFamily="IBM Plex Sans" fill="#94A3B8">
        Port areas in mm² · Throat P7 = 102 mm² (minimum)
      </text>

      {/* Section labels */}
      <text x={XS + SPAN * 0.21} y={14} textAnchor="middle" fontSize="8.5"
        fontFamily="IBM Plex Sans" fontWeight="600" fill="#475569">Converging Section</text>
      <text x={throatX} y={14} textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono" fill="#D97706">↕</text>
      <text x={XS + SPAN * 0.73} y={14} textAnchor="middle" fontSize="8.5"
        fontFamily="IBM Plex Sans" fontWeight="600" fill="#475569">Diverging Section</text>

      {/* Inlet / Outlet */}
      <text x={XS + 4} y={CY + 7} fontSize="8" fontFamily="IBM Plex Sans" fill="#94A3B8" fontWeight="600">INLET</text>
      <text x={XE - 4} y={CY + 7} fontSize="8" fontFamily="IBM Plex Sans" fill="#94A3B8" fontWeight="600" textAnchor="end">OUTLET</text>
    </svg>
  );
}

/* ─── Component info card ─── */
function ComponentCard({ title, tip }) {
  return (
    <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(13,148,136,0.10)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginTop: 1,
      }}>
        <span style={{ color: '#0D9488', fontSize: 12, fontWeight: 700 }}>≡</span>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 5 }}>
          {title}
          <Tooltip text={tip} />
        </div>
        <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.65 }}>{tip}</div>
      </div>
    </div>
  );
}

export default function ApparatusPage() {
  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-header">
          <h1>Apparatus — Venturimeter Setup</h1>
          <p>
            Schematic of Experiment 8. The flow circuit (top) shows the complete
            closed-loop system; the cross-section (bottom) shows the 10 pressure port positions.
            Hover the <strong>ⓘ</strong> icons for component details.
          </p>
        </div>

        {/* ── Flow Circuit ── */}
        <div className="card" style={{ padding: '20px 16px 16px', marginBottom: 24 }}>
          <div className="panel-label">Flow Circuit Schematic</div>
          <div className="callout" style={{ marginBottom: 16, fontSize: 12.5 }}>
            <strong>Flow path:</strong> Supply Tank → Inlet Valve → Venturimeter (P1–P10) →
            Collecting Tank → Drain Valve → Sump Tank → Pump → Supply Tank (closed loop).
          </div>
          <FlowCircuit />
        </div>

        {/* ── Venturi Cross-Section ── */}
        <div className="card" style={{ padding: '20px 16px 16px', marginBottom: 24 }}>
          <div className="panel-label">Venturimeter Cross-Section (Pressure Port Positions)</div>
          <VenturiDetail />
        </div>

        {/* ── Component Reference ── */}
        <div>
          <div className="panel-label">Component Reference</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              ['Supply / Overhead Tank',  COMPONENT_TIPS.supply],
              ['Centrifugal Pump',        COMPONENT_TIPS.pump],
              ['Inlet Control Valve',     COMPONENT_TIPS.inlet_valve],
              ['Overflow Pipe',           COMPONENT_TIPS.overflow],
              ['Venturimeter',            COMPONENT_TIPS.venturi],
              ['Piezometer / Manometer Bank', COMPONENT_TIPS.piezometer],
              ['Collecting Tank',         COMPONENT_TIPS.collecting],
              ['Drain Valve',             COMPONENT_TIPS.drain_valve],
              ['Sump Tank',               COMPONENT_TIPS.sump],
            ].map(([title, tip]) => (
              <ComponentCard key={title} title={title} tip={tip} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
