import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';

/**
 * Generate SVG path for a gear shape.
 * @param {number} outerR  — tip radius (tooth tip)
 * @param {number} innerR  — root radius (valley / dedendum)
 * @param {number} N       — number of teeth
 */
function gearPath(outerR, innerR, N) {
  const step = (2 * Math.PI) / N;
  const half = step * 0.28; // each tooth occupies ~56% of pitch angle
  let d = '';

  for (let i = 0; i < N; i++) {
    const mid = i * step - Math.PI / 2;
    const aL = mid - half; // tooth left angle
    const aR = mid + half; // tooth right angle

    const vx = +(innerR * Math.cos(aL)).toFixed(3);
    const vy = +(innerR * Math.sin(aL)).toFixed(3);

    if (i === 0) {
      d += `M ${vx},${vy} `;
    } else {
      // Arc along root circle (valley)
      d += `A ${innerR} ${innerR} 0 0 1 ${vx},${vy} `;
    }

    // Rise to tip — left flank
    d += `L ${+(outerR * Math.cos(aL)).toFixed(3)},${+(outerR * Math.sin(aL)).toFixed(3)} `;
    // Tooth face (small arc at tip — slight rounding)
    d += `A ${outerR} ${outerR} 0 0 1 ${+(outerR * Math.cos(aR)).toFixed(3)},${+(outerR * Math.sin(aR)).toFixed(3)} `;
    // Fall to root — right flank
    d += `L ${+(innerR * Math.cos(aR)).toFixed(3)},${+(innerR * Math.sin(aR)).toFixed(3)} `;
  }

  d += 'Z';
  return d;
}

// Pre-compute gear paths (static — only computed once)
const LARGE_PATH  = gearPath(55, 42, 14);  // big   gear — brand color
const MEDIUM_PATH = gearPath(36, 26, 9);   // mid   gear — steel
const SMALL_PATH  = gearPath(21, 15, 5);   // small gear — steel dark

/**
 * GearIcon
 *
 * Layout (viewBox 220 165):
 *   Large gear  — center (75, 95)  — 14 teeth, R=55
 *   Medium gear — center (166, 95) — 9 teeth,  R=36   ← meshes with large (dist=91=55+36)
 *   Small gear  — center (166, 37) — 5 teeth,  R=21   ← meshes with medium (dist=58=36+22)
 *
 * Rotation ratios (for realistic meshing):
 *   Large  : 3.0s CW  (ω₁)
 *   Medium : 3×9/14 ≈ 1.93s CCW  (ω₂ = ω₁ × N₁/N₂)
 *   Small  : 3×5/14×... = 1.93×5/9 ≈ 1.07s CW
 */
function GearIcon() {
  return (
    <svg
      viewBox="0 0 220 165"
      width="220"
      height="165"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ─── LARGE GEAR (amber / brand) ─── */}
      <g transform="translate(75 95)"
        style={{ animation: 'gearCW 3s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* Gear body */}
        <path d={LARGE_PATH} fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
        {/* Hub ring */}
        <circle cx="0" cy="0" r="28" fill="#78350f" stroke="#fbbf24" strokeWidth="2"/>
        {/* Spokes */}
        {[0, 51.4, 102.8, 154.2, 205.7, 257.1].map((deg, i) => (
          <line key={i}
            x1={+(10 * Math.cos(deg * Math.PI / 180)).toFixed(2)}
            y1={+(10 * Math.sin(deg * Math.PI / 180)).toFixed(2)}
            x2={+(25 * Math.cos(deg * Math.PI / 180)).toFixed(2)}
            y2={+(25 * Math.sin(deg * Math.PI / 180)).toFixed(2)}
            stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
          />
        ))}
        {/* Center bolt */}
        <circle cx="0" cy="0" r="9"  fill="#92400e" stroke="#fbbf24" strokeWidth="2"/>
        <circle cx="0" cy="0" r="4"  fill="#fbbf24"/>
        <circle cx="0" cy="0" r="2"  fill="#fff7ed"/>
      </g>

      {/* ─── MEDIUM GEAR (cool steel) ─── */}
      <g transform="translate(166 95)"
        style={{ animation: 'gearCCW 1.93s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <path d={MEDIUM_PATH} fill="#334155" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5"/>
        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <line key={i}
            x1={+(6 * Math.cos(deg * Math.PI / 180)).toFixed(2)}
            y1={+(6 * Math.sin(deg * Math.PI / 180)).toFixed(2)}
            x2={+(14 * Math.cos(deg * Math.PI / 180)).toFixed(2)}
            y2={+(14 * Math.sin(deg * Math.PI / 180)).toFixed(2)}
            stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
          />
        ))}
        <circle cx="0" cy="0" r="5"  fill="#334155" stroke="#94a3b8" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="2.5" fill="#94a3b8"/>
      </g>

      {/* ─── SMALL GEAR (darker steel) ─── */}
      <g transform="translate(166 37)"
        style={{ animation: 'gearCW 1.07s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <path d={SMALL_PATH} fill="#1e293b" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="0" cy="0" r="9"  fill="#0f172a" stroke="#64748b" strokeWidth="1.5"/>
        {/* Spokes */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <line key={i}
            x1={+(3.5 * Math.cos(deg * Math.PI / 180)).toFixed(2)}
            y1={+(3.5 * Math.sin(deg * Math.PI / 180)).toFixed(2)}
            x2={+(8 * Math.cos(deg * Math.PI / 180)).toFixed(2)}
            y2={+(8 * Math.sin(deg * Math.PI / 180)).toFixed(2)}
            stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"
          />
        ))}
        <circle cx="0" cy="0" r="3.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2"/>
        <circle cx="0" cy="0" r="1.5" fill="#64748b"/>
      </g>

      {/* ─── Subtle mesh highlight dots ─── */}
      {/* Where large and medium mesh */}
      <circle cx="130" cy="95" r="2.5" fill="#fbbf24" opacity="0.5"/>
      {/* Where medium and small mesh */}
      <circle cx="166" cy="58" r="2" fill="#94a3b8" opacity="0.5"/>
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
        @keyframes gearCW  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes gearCCW { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
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

              {/* Progress bar */}
              <div className="w-36 h-0.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70"
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
