import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';

/** ── Car Engine SVG Animation ─────────────────────────────
 *  Inspired by the V-engine photo:
 *  - 3 pistons (inline, staggered phase)
 *  - Crankshaft spinning with amber highlights
 *  - 3 blue belt pulleys (like the photo) connected by belt
 *  - Timing chain sprocket on top
 *  - Red spark plug wires
 *  - Curved intake pipes on the left
 */
function EngineIcon() {
  return (
    <svg
      viewBox="0 0 210 175"
      width="210"
      height="175"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Intake pipes (left side — like photo) ── */}
      <g opacity="0.85">
        <path d="M 15 65 Q 2 65 2 80 Q 2 95 12 98" fill="none" stroke="#3a3a3a" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 15 80 Q 1 80 1 95 Q 1 110 10 113" fill="none" stroke="#3a3a3a" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 15 95 Q 2 95 2 110 Q 2 125 11 128" fill="none" stroke="#3a3a3a" strokeWidth="5" strokeLinecap="round"/>
      </g>

      {/* ── Belt (behind pulleys) ── */}
      {/* Left belt edge */}
      <path d="M 140 115 L 145 77 L 149 50" fill="none" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right belt edge */}
      <path d="M 180 115 L 175 77 L 171 50" fill="none" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Belt surface texture lines */}
      <path d="M 140 115 L 145 77 L 149 50" fill="none" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 5"/>
      <path d="M 180 115 L 175 77 L 171 50" fill="none" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 5"/>

      {/* ── Engine block ── */}
      <rect x="14" y="55" width="118" height="95" rx="5" fill="#1e1e1e" stroke="#363636" strokeWidth="2"/>

      {/* ── Cylinder head ── */}
      <rect x="11" y="35" width="124" height="24" rx="4" fill="#252525" stroke="#404040" strokeWidth="2"/>

      {/* ── Valve cover ── */}
      <rect x="14" y="24" width="118" height="14" rx="3" fill="#2e2e2e" stroke="#484848" strokeWidth="1.5"/>

      {/* ── Coil pack ── */}
      <rect x="26" y="12" width="88" height="14" rx="3" fill="#272727" stroke="#4a4a4a" strokeWidth="1.5"/>

      {/* ── Spark plug wires (red) ── */}
      <line x1="44"  y1="24" x2="44"  y2="14" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="73"  y1="24" x2="73"  y2="14" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="102" y1="24" x2="102" y2="14" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/>

      {/* ── Cylinder bores ── */}
      <rect x="22" y="59" width="30" height="83" rx="2" fill="#121212" stroke="#2a2a2a" strokeWidth="1"/>
      <rect x="58" y="59" width="30" height="83" rx="2" fill="#121212" stroke="#2a2a2a" strokeWidth="1"/>
      <rect x="94" y="59" width="30" height="83" rx="2" fill="#121212" stroke="#2a2a2a" strokeWidth="1"/>

      {/* ── PISTON 1 (phase 0°) ── */}
      <g style={{ animation: 'pA 0.8s ease-in-out infinite 0s', transformBox: 'fill-box', transformOrigin: 'center top' }}>
        <rect x="24" y="64" width="26" height="17" rx="2" fill="#7a6030" stroke="#c8a040" strokeWidth="1.5"/>
        <line x1="24" y1="70" x2="50" y2="70" stroke="#e0b850" strokeWidth="1"/>
        <line x1="24" y1="74" x2="50" y2="74" stroke="#d0a840" strokeWidth="0.8"/>
        <line x1="37" y1="81" x2="37" y2="118" stroke="#585858" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="37" cy="81" r="3.5" fill="#f59e0b"/>
      </g>

      {/* ── PISTON 2 (phase 180°) ── */}
      <g style={{ animation: 'pB 0.8s ease-in-out infinite 0s', transformBox: 'fill-box', transformOrigin: 'center top' }}>
        <rect x="60" y="84" width="26" height="17" rx="2" fill="#7a6030" stroke="#c8a040" strokeWidth="1.5"/>
        <line x1="60" y1="90" x2="86" y2="90" stroke="#e0b850" strokeWidth="1"/>
        <line x1="60" y1="94" x2="86" y2="94" stroke="#d0a840" strokeWidth="0.8"/>
        <line x1="73" y1="101" x2="73" y2="133" stroke="#585858" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="73" cy="101" r="3.5" fill="#f59e0b"/>
      </g>

      {/* ── PISTON 3 (phase 90°) ── */}
      <g style={{ animation: 'pC 0.8s ease-in-out infinite 0s', transformBox: 'fill-box', transformOrigin: 'center top' }}>
        <rect x="96" y="74" width="26" height="17" rx="2" fill="#7a6030" stroke="#c8a040" strokeWidth="1.5"/>
        <line x1="96" y1="80" x2="122" y2="80" stroke="#e0b850" strokeWidth="1"/>
        <line x1="96" y1="84" x2="122" y2="84" stroke="#d0a840" strokeWidth="0.8"/>
        <line x1="109" y1="91" x2="109" y2="126" stroke="#585858" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="109" cy="91" r="3.5" fill="#f59e0b"/>
      </g>

      {/* ── Crankshaft ── */}
      <g transform="translate(73 143)" style={{ animation: 'crank 0.8s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="18" fill="#181818" stroke="#353535" strokeWidth="2"/>
        <circle cx="0" cy="0" r="6"  fill="#f59e0b"/>
        <line x1="0" y1="-13" x2="0"   y2="13"  stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="-13" y1="0" x2="13"  y2="0"   stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="0"  cy="-10" r="4" fill="#f59e0b"/>
        <circle cx="8"  cy="7"   r="3" fill="#e08000" opacity="0.8"/>
        <circle cx="-8" cy="7"   r="3" fill="#e08000" opacity="0.8"/>
      </g>

      {/* ── Oil pan ── */}
      <rect x="16" y="148" width="114" height="16" rx="4" fill="#161616" stroke="#2a2a2a" strokeWidth="1.5"/>
      <circle cx="73" cy="156" r="4" fill="#2a2a2a" stroke="#444" strokeWidth="1.2"/>

      {/* ── Timing sprocket (top right) ── */}
      <g transform="translate(136 28)" style={{ animation: 'crank 1.2s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="12" fill="#202020" stroke="#3b82f6" strokeWidth="2"/>
        <circle cx="0" cy="0" r="5"  fill="#1d40af"/>
        {/* Sprocket teeth */}
        {[0,45,90,135,180,225,270,315].map((a, i) => (
          <rect key={i}
            x="-2" y="-15"
            width="4" height="4"
            rx="1"
            fill="#3b82f6"
            transform={`rotate(${a})`}
            style={{ transformOrigin: '0px 0px', transformBox: 'fill-box' }}
          />
        ))}
      </g>

      {/* Timing chain links (animated) */}
      <g style={{ animation: 'chainMove 0.4s linear infinite' }}>
        {[0,8,16,24,32,40].map((offset, i) => (
          <circle key={i} cx="136" cy={28 + 14 + offset} r="2" fill="#444" opacity="0.8"/>
        ))}
      </g>

      {/* ── BLUE PULLEYS (right side — like photo) ── */}
      {/* Large bottom pulley — crankshaft drive */}
      <g transform="translate(160 125)" style={{ animation: 'crank 0.8s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="22" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="3"/>
        <circle cx="0" cy="0" r="12" fill="#1e40af" stroke="#2563eb" strokeWidth="2"/>
        <circle cx="0" cy="0" r="5"  fill="#60a5fa"/>
        <line x1="0" y1="-16" x2="0"   y2="16"  stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="-16" y1="0" x2="16"  y2="0"   stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="-11" y1="-11" x2="11" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="11"  y1="-11" x2="-11" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* Medium middle pulley */}
      <g transform="translate(160 80)" style={{ animation: 'crankR 1.3s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="14" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2.5"/>
        <circle cx="0" cy="0" r="7"  fill="#1e40af" stroke="#2563eb" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="3"  fill="#60a5fa"/>
        <line x1="0" y1="-10" x2="0"   y2="10"  stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
        <line x1="-10" y1="0" x2="10"  y2="0"   stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
      </g>

      {/* Small top pulley — alternator */}
      <g transform="translate(160 48)" style={{ animation: 'crank 2s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle cx="0" cy="0" r="10" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2"/>
        <circle cx="0" cy="0" r="5"  fill="#1e40af" stroke="#2563eb" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="2"  fill="#60a5fa"/>
        <line x1="0" y1="-7" x2="0"  y2="7"  stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="-7" y1="0" x2="7"  y2="0"  stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

/** ── GlobalLoadingOverlay ──────────────────────────────── */
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
        @keyframes pA {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-26px); }
        }
        @keyframes pB {
          0%, 100% { transform: translateY(-26px); }
          50%       { transform: translateY(0px); }
        }
        @keyframes pC {
          0%   { transform: translateY(-13px); }
          25%  { transform: translateY(-26px); }
          75%  { transform: translateY(0px); }
          100% { transform: translateY(-13px); }
        }
        @keyframes crank {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes crankR {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes chainMove {
          from { transform: translateY(0px); }
          to   { transform: translateY(8px); }
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
            {/* Ambient glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                              w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-56 h-56
                              rounded-full bg-blue-500/5 blur-[80px]" />
            </div>

            {/* Card */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative flex flex-col items-center gap-4 px-10 py-8
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
