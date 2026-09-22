import { useEffect, useRef, useMemo } from 'react';
import { PORT_AREAS_MM2, PORT_POSITIONS, PORT_LABELS } from '../physics/bernoulli';

const W = 900;
const H = 340;
const PIEZOMETER_H = 130;
const PIPE_Y = 220;
const PIPE_CENTER = PIPE_Y + 10;
const PIEZOMETER_BOTTOM = PIPE_Y - 8;

// Venturi wall profile: returns half-height at normalized x (0-1)
function venturiRadius(x, diameterScale = 1) {
  // Converging section (0 → 0.42): large to small
  // Throat (0.42 → 0.50): minimum radius
  // Diverging (0.50 → 1): small to large (slightly asymmetric, less steep)
  const r_inlet = 36 * diameterScale;
  const r_throat = 16 * diameterScale;
  const r_outlet = 33 * diameterScale;

  if (x < 0.42) {
    const t = x / 0.42;
    return r_inlet + (r_throat - r_inlet) * (1 - Math.pow(1 - t, 1.8));
  } else if (x <= 0.50) {
    const t = (x - 0.42) / 0.08;
    return r_throat + (r_throat * 0.05) * Math.sin(Math.PI * t);
  } else {
    const t = (x - 0.50) / 0.50;
    return r_throat + (r_outlet - r_throat) * Math.pow(t, 1.4);
  }
}

// Build venturi path from profile
function buildVenturiPaths(diameterScale = 1) {
  const steps = 120;
  const xStart = 50;
  const xEnd = 860;
  const xSpan = xEnd - xStart;

  const topPoints = [];
  const bottomPoints = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = xStart + t * xSpan;
    const r = venturiRadius(t, diameterScale);
    topPoints.push([px, PIPE_CENTER - r]);
    bottomPoints.push([px, PIPE_CENTER + r]);
  }

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  const topPath = toPath(topPoints);
  const bottomPath = toPath([...bottomPoints].reverse());
  const fillPath = `${topPath} ${bottomPath} Z`;

  return { topPath, bottomPath: toPath(bottomPoints), fillPath, topPoints, bottomPoints };
}

// Get pixel x position for a port by its position value
function portXPixel(position) {
  return 50 + position * 810;
}

// Pipe inner y-range at a given x position (normalized)
function pipeInnerRange(xNorm, diameterScale = 1) {
  const r = venturiRadius(xNorm, diameterScale);
  return { top: PIPE_CENTER - r + 2, bottom: PIPE_CENTER + r - 2 };
}

// Particle pool for flow animation
const NUM_PARTICLES = 36;

function initParticles(count) {
  return Array.from({ length: count }, (_, i) => {
    const x = Math.random();
    const y = 0.3 + Math.random() * 0.4;
    const xNorm = Math.max(0, Math.min(1, x));
    const r = venturiRadius(xNorm);
    const top = PIPE_CENTER - r + 2;
    const bottom = PIPE_CENTER + r - 2;
    const _py = top + y * (bottom - top);
    return {
      id: i,
      x,
      y,
      size: 2.5 + Math.random() * 1.5,
      phase: Math.random(),
      _py,
    };
  });
}

export default function VenturiSVG({ results, isRunning, flowSpeedFactor = 1, diameterScale = 1 }) {
  const particlesRef = useRef(initParticles(NUM_PARTICLES));
  const animRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const particleElemsRef = useRef([]);

  // Compute local velocity at each normalized x position based on simulation results
  const velocityProfile = useMemo(() => {
    if (!results || results.length === 0) return null;
    const maxV = Math.max(...results.map(r => r.velocity));
    return { results, maxV };
  }, [results]);

  function getSpeedAtX(xNorm) {
    if (!velocityProfile) return 0.5;
    const { results, maxV } = velocityProfile;
    // Find nearest port positions
    const portXs = PORT_POSITIONS;
    let lo = 0, hi = portXs.length - 1;
    for (let i = 0; i < portXs.length - 1; i++) {
      if (xNorm >= portXs[i] && xNorm <= portXs[i + 1]) { lo = i; hi = i + 1; break; }
    }
    if (xNorm < portXs[0]) return results[0].velocity / maxV;
    if (xNorm > portXs[portXs.length - 1]) return results[results.length - 1].velocity / maxV;

    const t = (xNorm - portXs[lo]) / (portXs[hi] - portXs[lo]);
    const v = results[lo].velocity * (1 - t) + results[hi].velocity * t;
    return v / maxV;
  }

  useEffect(() => {
    let lastTime = null;

    function tick(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      particlesRef.current = particlesRef.current.map((p) => {
        const speedFactor = isRunning ? getSpeedAtX(p.x) : 0;
        const baseSpeed = isRunning ? 0.28 * Math.max(0.35, flowSpeedFactor) : 0;
        let nx = p.x + baseSpeed * speedFactor * dt;
        if (nx > 1.08) nx = -0.08;

        // Keep particle within pipe profile
        const xNorm = Math.max(0, Math.min(1, nx));
        const { top, bottom } = pipeInnerRange(xNorm, diameterScale);
        const pipeFraction = p.y; // 0 = top inner wall, 1 = bottom inner wall
        const py = top + pipeFraction * (bottom - top);

        return { ...p, x: nx, _py: py };
      });

      // Update DOM elements
      particlesRef.current.forEach((p, i) => {
        const el = particleElemsRef.current[i];
        if (!el) return;
        const px = 50 + p.x * 810;
        const py = p._py || PIPE_CENTER;
        // Opacity fades at edges
        const inPipe = p.x >= 0 && p.x <= 1;
        const opacity = inPipe ? (0.55 + 0.4 * getSpeedAtX(p.x)) : 0;
        el.setAttribute('cx', px.toFixed(1));
        el.setAttribute('cy', py.toFixed(1));
        el.setAttribute('opacity', opacity.toFixed(2));
      });

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isRunning, velocityProfile, flowSpeedFactor, diameterScale]);

  const { topPath, bottomPath, fillPath, topPoints, bottomPoints } = useMemo(
    () => buildVenturiPaths(diameterScale),
    [diameterScale],
  );

  // Piezometer tube heights
  const maxTotalHead = results ? Math.max(...results.map(r => r.totalHead)) : 0.8;

  const ports = useMemo(() => {
    return PORT_POSITIONS.map((pos, i) => {
      const px = portXPixel(pos);
      const xNorm = pos;
      const r = venturiRadius(xNorm, diameterScale);
      const tubeBaseY = PIPE_CENTER - r - 2;
      const result = results ? results[i] : null;
      const headFraction = result ? Math.min(result.totalHead / (maxTotalHead * 1.15), 1) : 0.5;
      const tubeTopY = tubeBaseY - headFraction * PIEZOMETER_H;

      return { px, tubeBaseY, tubeTopY, result, label: PORT_LABELS[i], xNorm };
    });
  }, [results, maxTotalHead, diameterScale]);

  const throatX = portXPixel(0.42);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', maxWidth: '100%' }}
        aria-label="Venturimeter cross-section with animated flow and piezometer tubes"
      >
        <defs>
          {/* Fluid fill gradient */}
          <linearGradient id="fluidGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#0F3460" />
            <stop offset="42%" stopColor="#0F3460" />
            <stop offset="48%" stopColor="#0D9488" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#0F3460" />
            <stop offset="100%" stopColor="#0F3460" />
          </linearGradient>

          {/* Pipe wall gradient */}
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3A5F" />
            <stop offset="40%" stopColor="#0F2744" />
            <stop offset="100%" stopColor="#1E3A5F" />
          </linearGradient>

          {/* Piezometer water */}
          <linearGradient id="piezoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0F3460" stopOpacity="0.7" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrowTeal" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#14B8A6" />
          </marker>
        </defs>

        {/* ── Background ── */}
        <rect width={W} height={H} fill="#F8FAFC" />

        {/* ── Piezometer panel header ── */}
        <text x="20" y="38" fontSize="9" fontFamily="IBM Plex Mono" fill="#94A3B8" letterSpacing="2">
          PIEZOMETER PANEL — PRESSURE PORT READINGS
        </text>

        {/* ── Piezometer tubes ── */}
        {ports.map(({ px, tubeBaseY, tubeTopY, result, label }, i) => (
          <g key={label}>
            {/* Tube outline */}
            <rect
              x={px - 5}
              y={tubeTopY - 4}
              width={10}
              height={tubeBaseY - tubeTopY + 4}
              rx={3}
              fill="rgba(13,148,136,0.12)"
              stroke="#CBD5E1"
              strokeWidth="0.8"
            />
            {/* Water column */}
            <rect
              x={px - 4}
              y={tubeTopY}
              width={8}
              height={tubeBaseY - tubeTopY}
              rx={2}
              fill="url(#piezoGrad)"
              style={{ transition: 'y 0.5s ease, height 0.5s ease' }}
            />
            {/* Meniscus dot */}
            <ellipse cx={px} cy={tubeTopY} rx={4.5} ry={2.5} fill="#14B8A6" opacity={0.85} />
            {/* Port label */}
            <text x={px} y={tubeTopY - 8} textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono"
              fill="#64748B" fontWeight="600">{label}</text>
            {/* Head value */}
            {result && (
              <text x={px} y={tubeTopY - 18} textAnchor="middle" fontSize="7.5" fontFamily="IBM Plex Mono"
                fill="#0D9488">
                {(result.totalHead * 1000).toFixed(0)}
              </text>
            )}
            {/* Connector line from tube to pipe */}
            <line x1={px} y1={tubeBaseY} x2={px} y2={PIPE_CENTER - venturiRadius(PORT_POSITIONS[i], diameterScale) + 1}
              stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" />
          </g>
        ))}

        {/* ── Venturi pipe wall (filled shape) ── */}
        <path d={fillPath} fill="url(#wallGrad)" stroke="#1E3A5F" strokeWidth="1.5" />

        {/* ── Fluid fill inside pipe ── */}
        <clipPath id="pipeClip">
          <path d={`${topPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} ${[...bottomPoints].reverse().map((p, i) => `${i === 0 ? 'L' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} Z`} />
        </clipPath>
        <rect x="45" y={PIPE_CENTER - 45} width="820" height="90" fill="url(#fluidGrad)" clipPath="url(#pipeClip)" opacity="0.85" />

        {/* ── Flow particles ── */}
        <g clipPath="url(#pipeClip)">
          {particlesRef.current.map((p, i) => (
            <circle
              key={p.id}
              ref={el => particleElemsRef.current[i] = el}
              r={p.size}
              fill="#14B8A6"
              opacity={0}
            />
          ))}
        </g>

        {/* ── Throat annotation ── */}
        <line x1={throatX} y1={PIPE_CENTER - 16} x2={throatX} y2={PIPE_CENTER - 55}
          stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
        <text x={throatX + 4} y={PIPE_CENTER - 56} fontSize="9" fontFamily="IBM Plex Sans"
          fill="#D97706" fontWeight="600">THROAT</text>
        <text x={throatX + 4} y={PIPE_CENTER - 46} fontSize="7.5" fontFamily="IBM Plex Mono"
          fill="#D97706">MAX V, MIN P</text>

        {/* ── Port dot markers on pipe ── */}
        {ports.map(({ px, xNorm, label }, i) => {
          const r = venturiRadius(xNorm, diameterScale);
          return (
            <circle key={`dot-${label}`} cx={px} cy={PIPE_CENTER - r + 2}
              r={2.5} fill="#0D9488" stroke="#fff" strokeWidth="1" />
          );
        })}

        {/* ── Flow direction arrows ── */}
        {[0.12, 0.35, 0.60, 0.84].map((t, i) => {
          const px = 50 + t * 810;
          const r = venturiRadius(t, diameterScale);
          const speed = results ? getSpeedAtX(t) : 0.5;
          return (
            <polygon key={i}
              points={`${px},${PIPE_CENTER - 1} ${px - 7 * speed * 1.5},${PIPE_CENTER - 3.5} ${px - 7 * speed * 1.5},${PIPE_CENTER + 3.5}`}
              fill="#14B8A6" opacity={isRunning ? 0.7 : 0.3}
            />
          );
        })}

        {/* ── Inlet / Outlet labels ── */}
        <text x={58} y={PIPE_CENTER + 56} fontSize="9" fontFamily="IBM Plex Sans" fill="#64748B" fontWeight="600">INLET</text>
        <text x={820} y={PIPE_CENTER + 56} fontSize="9" fontFamily="IBM Plex Sans" fill="#64748B" fontWeight="600">OUTLET</text>

        {/* ── Flow arrow at inlet ── */}
        <path d={`M20,${PIPE_CENTER} L44,${PIPE_CENTER}`} stroke="#14B8A6" strokeWidth={isRunning ? 2.5 : 1.5}
          markerEnd="url(#arrowTeal)" opacity={isRunning ? 1 : 0.4} />



        {/* ── Head scale indicator ── */}
        <text x={W - 10} y={50} textAnchor="end" fontSize="7.5" fontFamily="IBM Plex Mono" fill="#94A3B8">
          HEAD (mm)
        </text>
        <line x1={W - 12} y1={55} x2={W - 12} y2={PIEZOMETER_BOTTOM} stroke="#E2E8F0" strokeWidth="0.8" />
        <text x={W - 10} y={PIEZOMETER_BOTTOM} textAnchor="end" fontSize="7.5" fontFamily="IBM Plex Mono" fill="#94A3B8">0</text>
        <text x={W - 10} y={55 + (PIEZOMETER_BOTTOM - 55) * 0.33} textAnchor="end" fontSize="7.5"
          fontFamily="IBM Plex Mono" fill="#94A3B8">
          {(maxTotalHead * 1000 * 0.67).toFixed(0)}
        </text>
        <text x={W - 10} y={60} textAnchor="end" fontSize="7.5" fontFamily="IBM Plex Mono" fill="#94A3B8">
          {(maxTotalHead * 1000 * 1.15).toFixed(0)}
        </text>
      </svg>
    </div>
  );
}
