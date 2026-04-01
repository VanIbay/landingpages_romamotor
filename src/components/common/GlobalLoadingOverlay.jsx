import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';

/** Generate SVG path for a gear shape centered at (0,0). */
function gearPath(outerR, innerR, N) {
  const step = (2 * Math.PI) / N;
  const half = step * 0.28;
  let d = '';
  for (let i = 0; i < N; i++) {
    const mid = i * step - Math.PI / 2;
    const aL = mid - half;
    const aR = mid + half;
    const vx = +(innerR * Math.cos(aL)).toFixed(3);
    const vy = +(innerR * Math.sin(aL)).toFixed(3);
    if (i === 0) d += `M ${vx},${vy} `;
    else d += `A ${innerR} ${innerR} 0 0 1 ${vx},${vy} `;
    d += `L ${+(outerR * Math.cos(aL)).toFixed(3)},${+(outerR * Math.sin(aL)).toFixed(3)} `;
    d += `A ${outerR} ${outerR} 0 0 1 ${+(outerR * Math.cos(aR)).toFixed(3)},${+(outerR * Math.sin(aR)).toFixed(3)} `;
    d += `L ${+(innerR * Math.cos(aR)).toFixed(3)},${+(innerR * Math.sin(aR)).toFixed(3)} `;
  }
  return d + 'Z';
}

// Pre-computed gear paths (centered at 0,0)
const LARGE_PATH  = gearPath(55, 42, 14);
const MEDIUM_PATH = gearPath(36, 26, 9);
const SMALL_PATH  = gearPath(22, 16, 6);

/**
 * GearIcon — 3 gears with correct meshing ratios.
 *
 * Layout (viewBox 220 165):
 *   Large  : center (75,  95) — R=55, N=14 — spins CW  3.0s
 *   Medium : center (166, 95) — R=36, N=9  — spins CCW 1.93s  (dist from large = 91 = 55+36 ✓)
 *   Small  : center (166, 37) — R=22, N=6  — spins CW  1.29s  (dist from medium = 58 = 36+22 ✓)
 *
 * KEY: outer <g> uses SVG transform attribute for POSITION (not CSS),
 *      inner <g> uses CSS animation for ROTATION only — no conflict!
 */
function GearIcon() {
  return (
    <svg
      viewBox="0 0 220 165"
      width="220"
      height="165"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      overflow="visible"
    >
      {/* ─── LARGE GEAR — amber, brand color ─── */}
      {/* Outer g: SVG attribute for position (immune to CSS override) */}
      <g transform="translate(75,95)">
        {/* Inner g: CSS animation for rotation only, origin (0,0) = gear center */}
        <g style={{ animation: 'gearCW 3s linear infinite', transformOrigin: '0px 0px' }}>
          <path d={LARGE_PATH} fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="0" cy="0" r="28" fill="#78350f" stroke="#fbbf24" strokeWidth="2"/>
          {/* 6 spokes evenly spaced */}
          {[0,60,120,180,240,300].map((deg,i) => (
            <line key={i}
              x1={+(10*Math.cos(deg*Math.PI/180)).toFixed(2)} y1={+(10*Math.sin(deg*Math.PI/180)).toFixed(2)}
              x2={+(26*Math.cos(deg*Math.PI/180)).toFixed(2)} y2={+(26*Math.sin(deg*Math.PI/180)).toFixed(2)}
              stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
            />
          ))}
          <circle cx="0" cy="0" r="9"  fill="#92400e" stroke="#fbbf24" strokeWidth="2"/>
          <circle cx="0" cy="0" r="4"  fill="#fbbf24"/>
          <circle cx="0" cy="0" r="1.8" fill="#fff7ed"/>
        </g>
      </g>

      {/* ─── MEDIUM GEAR — steel blue ─── */}
      <g transform="translate(166,95)">
        <g style={{ animation: 'gearCCW 1.93s linear infinite', transformOrigin: '0px 0px' }}>
          <path d={MEDIUM_PATH} fill="#334155" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5"/>
          {[0,60,120,180,240,300].map((deg,i) => (
            <line key={i}
              x1={+(6*Math.cos(deg*Math.PI/180)).toFixed(2)} y1={+(6*Math.sin(deg*Math.PI/180)).toFixed(2)}
              x2={+(14*Math.cos(deg*Math.PI/180)).toFixed(2)} y2={+(14*Math.sin(deg*Math.PI/180)).toFixed(2)}
              stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
            />
          ))}
          <circle cx="0" cy="0" r="5"   fill="#334155" stroke="#94a3b8" strokeWidth="1.5"/>
          <circle cx="0" cy="0" r="2.5" fill="#94a3b8"/>
        </g>
      </g>

      {/* ─── SMALL GEAR — dark steel ─── */}
      <g transform="translate(166,37)">
        <g style={{ animation: 'gearCW 1.29s linear infinite', transformOrigin: '0px 0px' }}>
          <path d={SMALL_PATH} fill="#1e293b" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#64748b" strokeWidth="1.5"/>
          {[0,60,120,180,240,300].map((deg,i) => (
            <line key={i}
              x1={+(4*Math.cos(deg*Math.PI/180)).toFixed(2)} y1={+(4*Math.sin(deg*Math.PI/180)).toFixed(2)}
              x2={+(9*Math.cos(deg*Math.PI/180)).toFixed(2)} y2={+(9*Math.sin(deg*Math.PI/180)).toFixed(2)}
              stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"
            />
          ))}
          <circle cx="0" cy="0" r="3.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2"/>
          <circle cx="0" cy="0" r="1.5" fill="#64748b"/>
        </g>
      </g>

      {/* mesh-point highlights */}
      <circle cx="130" cy="95" r="2.5" fill="#fbbf24" opacity="0.5"/>
      <circle cx="166" cy="59" r="2"   fill="#94a3b8" opacity="0.5"/>
    </svg>
  );
}

/** ── GlobalLoadingOverlay ────────────────────────────── */
export default function GlobalLoadingOverlay() {
  const { loading } = useData();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  const isAllowedRoute =
    pathname === '/' ||
    pathname.startsWith('/sadux/dashboard') ||
    pathname.startsWith('/blog');

  useEffect(() => {
    if (loading && isAllowedRoute) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 450);
      return () => clearTimeout(t);
    }
  }, [loading, isAllowedRoute]);

  return (
    <>
      <style>{`
        @keyframes gearCW  { from { transform: rotate(0deg); }    to { transform: rotate(360deg); } }
        @keyframes gearCCW { from { transform: rotate(0deg); }    to { transform: rotate(-360deg); } }
      `}</style>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-bg"
            aria-live="polite"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                              w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
            </div>

            {/* Card */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative flex flex-col items-center gap-5 px-10 py-8
                         rounded-3xl bg-dark-card/80 backdrop-blur-xl
                         border border-white/8 shadow-2xl"
            >
              <GearIcon />

              <div className="text-center space-y-1">
                <p className="text-white font-heading font-bold text-base tracking-wide">
                  Roma<span className="text-primary">Motor</span>
                </p>
                <p className="text-gray-500 text-sm">Memuat data…</p>
              </div>

              <div className="w-36 h-0.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-primary/70"
                  style={{ animation: 'loadingBar 1.8s ease-in-out infinite' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
