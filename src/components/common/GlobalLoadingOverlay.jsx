import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';

/**
 * Generate mathematically precise involute-like SVG gear path.
 * R_pitch = N * m / 2.
 * Calculates explicit gaps and teeth angles to mesh cleanly.
 */
function createGearPath(N, m) {
  const pitchR = N * m / 2;
  const outerR = pitchR + 1.0 * m;
  const innerR = Math.max(pitchR - 1.25 * m, 1);
  const step = (2 * Math.PI) / N;
  let d = '';

  for (let i = 0; i < N; i++) {
    const mid = i * step - Math.PI / 2;
    // Tooth widths
    const tL = mid - step * 0.12;
    const tR = mid + step * 0.12;
    // Root widths
    const bL = mid - step * 0.25;
    const bR = mid + step * 0.25;

    const rootX = +(innerR * Math.cos(bL)).toFixed(3);
    const rootY = +(innerR * Math.sin(bL)).toFixed(3);

    if (i === 0) d += `M ${rootX},${rootY} `;

    // Tip line
    d += `L ${+(outerR * Math.cos(tL)).toFixed(3)},${+(outerR * Math.sin(tL)).toFixed(3)} `;
    // Tip arc
    d += `A ${outerR} ${outerR} 0 0 1 ${+(outerR * Math.cos(tR)).toFixed(3)},${+(outerR * Math.sin(tR)).toFixed(3)} `;
    // Root line
    d += `L ${+(innerR * Math.cos(bR)).toFixed(3)},${+(innerR * Math.sin(bR)).toFixed(3)} `;

    // Bottom arc to next tooth
    if (i < N - 1) {
      const nextMid = (i + 1) * step - Math.PI / 2;
      const nextBL = nextMid - step * 0.25;
      d += `A ${innerR} ${innerR} 0 0 1 ${+(innerR * Math.cos(nextBL)).toFixed(3)},${+(innerR * Math.sin(nextBL)).toFixed(3)} `;
    } else {
      const firstMid = 0 * step - Math.PI / 2;
      const firstBL = firstMid - step * 0.25;
      d += `A ${innerR} ${innerR} 0 0 1 ${+(innerR * Math.cos(firstBL)).toFixed(3)},${+(innerR * Math.sin(firstBL)).toFixed(3)} `;
    }
  }
  return d + 'Z';
}

const MODULE = 5.5;
// Pre-computed gear paths (centered at 0,0)
const LARGE_PATH  = createGearPath(18, MODULE); 
const MEDIUM_PATH = createGearPath(10, MODULE);
const SMALL_PATH  = createGearPath(6, MODULE);

/**
 * GearIcon — 3 physically accurate, closely clustered gears.
 * Center distances EXACTLY match Pitch Radii sums (Rp1 + Rp2)
 *
 * Pitch Radii (Rp = N * m / 2):
 * Large (N=18): Rp = 49.5
 * Medium(N=10): Rp = 27.5
 * Small (N=6):  Rp = 16.5
 *
 * Distance L-M = 49.5 + 27.5 = 77
 * Distance M-S = 27.5 + 16.5 = 44
 */
function GearIcon() {
  return (
    <svg
      viewBox="0 0 230 165"
      width="230"
      height="165"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      overflow="visible"
    >
      {/* ─── LARGE GEAR — amber, brand color ─── */}
      <g transform="translate(85,95)">
        <g style={{ animation: 'gearCW 3.6s linear infinite', transformOrigin: '0px 0px' }}>
          <path d={LARGE_PATH} fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="0" cy="0" r="30" fill="#78350f" stroke="#fbbf24" strokeWidth="2"/>
          {/* 6 spokes */}
          {[0,60,120,180,240,300].map((deg,i) => (
            <line key={i}
              x1={+(12*Math.cos(deg*Math.PI/180)).toFixed(2)} y1={+(12*Math.sin(deg*Math.PI/180)).toFixed(2)}
              x2={+(28*Math.cos(deg*Math.PI/180)).toFixed(2)} y2={+(28*Math.sin(deg*Math.PI/180)).toFixed(2)}
              stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
            />
          ))}
          <circle cx="0" cy="0" r="10" fill="#92400e" stroke="#fbbf24" strokeWidth="2"/>
          <circle cx="0" cy="0" r="4"  fill="#fbbf24"/>
          <circle cx="0" cy="0" r="1.5" fill="#fff7ed"/>
        </g>
      </g>

      {/* ─── MEDIUM GEAR — steel blue ─── */}
      {/* align right matching L-M pitch dist (77). Offset +18deg for tooth-gap interlocking */}
      <g transform="translate(162,95) rotate(18)">
        <g style={{ animation: 'gearCCW 2.0s linear infinite', transformOrigin: '0px 0px' }}>
          <path d={MEDIUM_PATH} fill="#334155" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="0" cy="0" r="15" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5"/>
          {/* 5 spokes */}
          {[0,72,144,216,288].map((deg,i) => (
            <line key={i}
              x1={+(5*Math.cos(deg*Math.PI/180)).toFixed(2)} y1={+(5*Math.sin(deg*Math.PI/180)).toFixed(2)}
              x2={+(14*Math.cos(deg*Math.PI/180)).toFixed(2)} y2={+(14*Math.sin(deg*Math.PI/180)).toFixed(2)}
              stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
            />
          ))}
          <circle cx="0" cy="0" r="6"   fill="#334155" stroke="#94a3b8" strokeWidth="1.5"/>
          <circle cx="0" cy="0" r="2.5" fill="#94a3b8"/>
        </g>
      </g>

      {/* ─── SMALL GEAR — dark steel ─── */}
      {/* align up matching M-S pitch dist (44). No base rotation needed */}
      <g transform="translate(162,51)">
        <g style={{ animation: 'gearCW 1.2s linear infinite', transformOrigin: '0px 0px' }}>
          <path d={SMALL_PATH} fill="#1e293b" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="0" cy="0" r="8" fill="#0f172a" stroke="#64748b" strokeWidth="1.5"/>
          <circle cx="0" cy="0" r="3.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2"/>
          {/* 3 dots instead of spokes */}
          {[0,120,240].map((deg,i) => (
            <circle key={i}
              cx={+(5*Math.cos(deg*Math.PI/180)).toFixed(2)} cy={+(5*Math.sin(deg*Math.PI/180)).toFixed(2)}
              r="1" fill="#475569"
            />
          ))}
        </g>
      </g>

      {/* mesh-point friction highlights */}
      <circle cx="134.5" cy="95" r="2.5" fill="#fbbf24" opacity="0.6"/>
      <circle cx="162" cy="67.5" r="2"   fill="#94a3b8" opacity="0.6"/>
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
        /* Negative keyframes for CCW so we don't interfere with initial rotation attributes */
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
