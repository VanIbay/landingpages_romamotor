import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';

/**
 * Engine SVG — Front accessory-drive view
 * Crankshaft pulley besar di bawah, 2 pulley medium di atas,
 * belt menghubungkan semuanya — mirip foto engine di car hood.
 */
function EngineIcon() {
  return (
    <svg
      viewBox="0 0 240 210"
      width="240"
      height="210"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ─── ENGINE BLOCK (background plate) ─── */}
      <rect x="10" y="10" width="220" height="190" rx="10"
        fill="#161616" stroke="#2e2e2e" strokeWidth="2"/>

      {/* Block top section (cylinder head area) */}
      <rect x="10" y="10" width="220" height="55" rx="10"
        fill="#1e1e1e" stroke="#333" strokeWidth="1.5"/>

      {/* Valve cover ribs */}
      {[40, 80, 120, 160, 200].map((x, i) => (
        <rect key={i} x={x - 14} y="15" width="28" height="44" rx="4"
          fill="#242424" stroke="#383838" strokeWidth="1"/>
      ))}

      {/* Oil fill cap */}
      <circle cx="40" cy="37" r="10" fill="#222" stroke="#555" strokeWidth="1.5"/>
      <circle cx="40" cy="37" r="5" fill="#333" stroke="#4a4a4a" strokeWidth="1"/>

      {/* Coolant cap */}
      <circle cx="200" cy="37" r="9" fill="#1a3a55" stroke="#2563eb" strokeWidth="1.5"/>
      <circle cx="200" cy="37" r="4" fill="#1e3a8a"/>

      {/* Head-to-block seam line */}
      <line x1="10" y1="65" x2="230" y2="65" stroke="#2e2e2e" strokeWidth="2"/>

      {/* Mounting bolts */}
      {[30, 80, 120, 160, 210].map((x, i) => (
        <circle key={i} cx={x} cy="71" r="4" fill="#222" stroke="#444" strokeWidth="1"/>
      ))}

      {/* Block body detail lines */}
      <line x1="10" y1="120" x2="230" y2="120" stroke="#242424" strokeWidth="1.5"/>
      <line x1="10" y1="155" x2="230" y2="155" stroke="#242424" strokeWidth="1.5"/>

      {/* ─── SPARK PLUG WIRES (red) ─── */}
      <line x1="80"  y1="10" x2="80"  y2="0"  stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
      <line x1="120" y1="10" x2="120" y2="0"  stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
      <line x1="160" y1="10" x2="160" y2="0"  stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>

      {/* ─── BELT PATH (behind pulleys) ─── */}
      {/* Outer belt path — goes around all pulleys */}
      <path
        d="M 120 170 L 52 130 L 48 82 L 120 60 L 192 82 L 188 130 Z"
        fill="none" stroke="#111" strokeWidth="10" strokeLinejoin="round"
      />
      {/* Belt surface texture */}
      <path
        d="M 120 170 L 52 130 L 48 82 L 120 60 L 192 82 L 188 130 Z"
        fill="none" stroke="#1c1c1c" strokeWidth="6"
        strokeLinejoin="round" strokeDasharray="6 6"
        style={{ animation: 'beltMove 0.4s linear infinite' }}
      />

      {/* ─── BLUE PULLEYS ─── */}

      {/* 1. LEFT TOP — Alternator pulley (medium) */}
      <g transform="translate(48 82)"
        style={{ animation: 'spinCCW 1.2s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="20" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="3"/>
        <circle cx="0" cy="0" r="10" fill="#1e40af" stroke="#2563eb" strokeWidth="2"/>
        <circle cx="0" cy="0" r="4"  fill="#93c5fd"/>
        <line x1="0" y1="-14" x2="0"   y2="14"   stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="-14" y1="0" x2="14"  y2="0"    stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="-10" y1="-10" x2="10" y2="10"  stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10" y1="-10"  x2="-10" y2="10" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* 2. RIGHT TOP — Power steering pulley (medium) */}
      <g transform="translate(192 82)"
        style={{ animation: 'spinCCW 1.2s linear infinite 0.4s', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="18" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="3"/>
        <circle cx="0" cy="0" r="9"  fill="#1e40af" stroke="#2563eb" strokeWidth="2"/>
        <circle cx="0" cy="0" r="3.5" fill="#93c5fd"/>
        <line x1="0" y1="-12" x2="0"   y2="12"   stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
        <line x1="-12" y1="0" x2="12"  y2="0"    stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
        <line x1="-8" y1="-8"  x2="8"  y2="8"    stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8"  y1="-8"  x2="-8" y2="8"    stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* 3. LEFT MID — Idler pulley (small) */}
      <g transform="translate(52 130)"
        style={{ animation: 'spinCW 0.8s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2.5"/>
        <circle cx="0" cy="0" r="6"  fill="#1e40af" stroke="#2563eb" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="2.5" fill="#93c5fd"/>
        <line x1="0" y1="-9"  x2="0"  y2="9"  stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
        <line x1="-9" y1="0"  x2="9"  y2="0"  stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      </g>

      {/* 4. RIGHT MID — AC Compressor pulley (small) */}
      <g transform="translate(188 130)"
        style={{ animation: 'spinCW 0.8s linear infinite 0.2s', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2.5"/>
        <circle cx="0" cy="0" r="6"  fill="#1e40af" stroke="#2563eb" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="2.5" fill="#93c5fd"/>
        <line x1="0" y1="-9"  x2="0"  y2="9"  stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
        <line x1="-9" y1="0"  x2="9"  y2="0"  stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      </g>

      {/* 5. TOP CENTER — Water pump / tensioner */}
      <g transform="translate(120 60)"
        style={{ animation: 'spinCCW 1.6s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="11" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2.5"/>
        <circle cx="0" cy="0" r="5"  fill="#1e40af" stroke="#2563eb" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="2"  fill="#93c5fd"/>
        <line x1="0" y1="-7"  x2="0"  y2="7"  stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="-7" y1="0"  x2="7"  y2="0"  stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* 6. BOTTOM CENTER — Crankshaft pulley (LARGEST, most prominent) */}
      <g transform="translate(120 170)"
        style={{ animation: 'spinCW 0.8s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* Outer damper ring */}
        <circle cx="0" cy="0" r="30" fill="#1a2f6e" stroke="#3b82f6" strokeWidth="3.5"/>
        {/* Damper groove */}
        <circle cx="0" cy="0" r="22" fill="none" stroke="#1e40af" strokeWidth="4"/>
        {/* Inner hub */}
        <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#2563eb" strokeWidth="2"/>
        {/* Center bolt */}
        <circle cx="0" cy="0" r="6"  fill="#60a5fa"/>
        <circle cx="0" cy="0" r="3"  fill="#bfdbfe"/>
        {/* Spokes */}
        <line x1="0" y1="-20" x2="0"   y2="20"  stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/>
        <line x1="-20" y1="0" x2="20"  y2="0"   stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/>
        <line x1="-14" y1="-14" x2="14" y2="14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14"  y1="-14" x2="-14" y2="14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      </g>

      {/* ─── BRACKET / MOUNTING (structural detail) ─── */}
      <line x1="68"  y1="82"  x2="100" y2="82"  stroke="#282828" strokeWidth="6" strokeLinecap="round"/>
      <line x1="172" y1="82"  x2="140" y2="82"  stroke="#282828" strokeWidth="6" strokeLinecap="round"/>
      <line x1="66"  y1="130" x2="105" y2="155" stroke="#282828" strokeWidth="6" strokeLinecap="round"/>
      <line x1="174" y1="130" x2="135" y2="155" stroke="#282828" strokeWidth="6" strokeLinecap="round"/>

      {/* ─── BOTTOM PLATE (oil pan) ─── */}
      <rect x="10" y="192" width="220" height="14" rx="0 0 10 10"
        fill="#111" stroke="#252525" strokeWidth="1.5"/>
      <circle cx="120" cy="199" r="5" fill="#222" stroke="#3a3a3a" strokeWidth="1.2"/>
    </svg>
  );
}

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
        @keyframes spinCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinCCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes beltMove {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -12; }
        }
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
                              w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[140px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                              w-[300px] h-[300px] rounded-full bg-primary/8 blur-[80px]" />
            </div>

            {/* Card */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative flex flex-col items-center gap-3 px-8 py-7
                         rounded-3xl bg-dark-card/80 backdrop-blur-xl
                         border border-white/8 shadow-2xl"
            >
              <EngineIcon />

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
