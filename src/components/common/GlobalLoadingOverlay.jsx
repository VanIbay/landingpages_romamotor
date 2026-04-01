import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

/**
 * GlobalLoadingOverlay
 * Muncul sebagai full-screen modal saat DataContext sedang fetch data dari Google Sheets.
 * Otomatis hilang setelah data selesai dimuat.
 */
export default function GlobalLoadingOverlay() {
  const { loading } = useData();
  // Keep showing for min 400ms to avoid flicker on fast connections
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    } else {
      setVisible(true);
    }
  }, [loading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-bg"
          aria-live="polite"
          aria-label="Memuat data"
        >
          {/* Ambient glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-[80px]" />
          </div>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative flex flex-col items-center gap-6 px-10 py-10 rounded-3xl bg-dark-card/80 backdrop-blur-xl border border-white/8 shadow-2xl"
          >
            {/* Spinner ring */}
            <div className="relative w-16 h-16">
              {/* Outer track */}
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              {/* Spinning arc */}
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: 'var(--color-primary, #f59e0b)',
                  borderRightColor: 'var(--color-primary, #f59e0b)',
                  animation: 'spin 0.9s linear infinite',
                }}
              />
              {/* Inner dot pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-2 h-2 rounded-full bg-primary"
                  style={{ animation: 'pulse 1.4s ease-in-out infinite' }}
                />
              </div>
            </div>

            {/* Brand */}
            <div className="text-center space-y-1">
              <p className="text-white font-heading font-bold text-lg tracking-wide">
                Roma<span className="text-primary">Motor</span>
              </p>
              <p className="text-gray-500 text-sm">Memuat data…</p>
            </div>

            {/* Animated progress bar */}
            <div className="w-40 h-0.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ animation: 'loadingBar 1.8s ease-in-out infinite' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
