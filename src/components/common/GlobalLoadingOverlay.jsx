import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';

/**
 * Animated piston SVG — mechanical up/down stroke
 */
function PistonIcon() {
  return (
    <svg
      viewBox="0 0 80 100"
      width="72"
      height="90"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Cylinder walls ── */}
      <rect x="18" y="42" width="44" height="58" rx="3"
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />

      {/* ── Cylinder head (top cap) ── */}
      <rect x="14" y="36" width="52" height="10" rx="3"
        fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {/* ── Spark plug ── */}
      <rect x="36" y="24" width="8" height="16" rx="2"
        fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <line x1="40" y1="24" x2="40" y2="20"
        stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
      {/* spark */}
      <g style={{ animation: 'spark 0.9s ease-in-out infinite' }}>
        <line x1="40" y1="40" x2="38" y2="43"
          stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="40" x2="42" y2="43"
          stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ── Piston head group (moves up/down) ── */}
      <g style={{ animation: 'pistonStroke 0.9s ease-in-out infinite' }}>
        {/* piston crown */}
        <rect x="20" y="46" width="40" height="14" rx="2"
          fill="rgba(251,191,36,0.25)" stroke="#f59e0b" strokeWidth="2" />
        {/* piston rings */}
        <line x1="20" y1="52" x2="60" y2="52"
          stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="20" y1="55" x2="60" y2="55"
          stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* connecting rod */}
        <line x1="40" y1="60" x2="40" y2="84"
          stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />

        {/* wrist pin */}
        <circle cx="40" cy="60" r="3"
          fill="#f59e0b" />
      </g>

      {/* ── Crank circle (rotates) ── */}
      <g transform="translate(40, 88)" style={{ animation: 'crankSpin 0.9s linear infinite', transformOrigin: '0px 0px' }}>
        <circle cx="0" cy="0" r="9"
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        {/* crank pin */}
        <circle cx="0" cy="-6" r="3"
          fill="#f59e0b" />
        {/* crank arm */}
        <line x1="0" y1="0" x2="0" y2="-6"
          stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * GlobalLoadingOverlay
 * Hanya muncul di landing page (/) dan CMS dashboard (/sadux/dashboard).
 * Tidak muncul di halaman login.
 */
export default function GlobalLoadingOverlay() {
  const { loading } = useData();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // Only show on landing page and CMS dashboard — NOT on login
  const isAllowedRoute =
    pathname === '/' ||
    pathname.startsWith('/sadux/dashboard') ||
    pathname.startsWith('/blog');

  useEffect(() => {
    if (loading && isAllowedRoute) {
      setVisible(true);
    } else {
      // Delay hide so fade-out animation can play
      const t = setTimeout(() => setVisible(false), 450);
      return () => clearTimeout(t);
    }
  }, [loading, isAllowedRoute]);

  return (
    <>
      {/* Piston keyframe styles */}
      <style>{`
        @keyframes pistonStroke {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-22px); }
        }
        @keyframes crankSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spark {
          0%, 40%, 100% { opacity: 0; }
          50%, 60%      { opacity: 1; }
        }
        @keyframes exhaustPuff {
          0%   { opacity: 0.7; transform: translateY(0) scale(1); }
          100% { opacity: 0;   transform: translateY(-18px) scale(2.2); }
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
            aria-label="Memuat data"
          >
            {/* Ambient glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                              w-[480px] h-[480px] rounded-full bg-primary/8 blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4
                              w-56 h-56 rounded-full bg-accent/5 blur-[80px]" />
            </div>

            {/* Card */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative flex flex-col items-center gap-5 px-12 py-10
                         rounded-3xl bg-dark-card/80 backdrop-blur-xl
                         border border-white/8 shadow-2xl"
            >
              {/* Exhaust puffs above piston */}
              <div className="relative">
                {/* Puff 1 */}
                <div className="absolute -top-3 left-4 w-3 h-3 rounded-full bg-white/10"
                  style={{ animation: 'exhaustPuff 0.9s ease-out infinite' }} />
                {/* Puff 2 */}
                <div className="absolute -top-3 right-4 w-2 h-2 rounded-full bg-white/8"
                  style={{ animation: 'exhaustPuff 0.9s ease-out infinite 0.3s' }} />
                {/* Puff 3 */}
                <div className="absolute -top-2 left-1/2 w-2.5 h-2.5 rounded-full bg-white/10"
                  style={{ animation: 'exhaustPuff 0.9s ease-out infinite 0.6s' }} />

                <PistonIcon />
              </div>

              {/* Brand + label */}
              <div className="text-center space-y-1.5">
                <p className="text-white font-heading font-bold text-lg tracking-wide">
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
