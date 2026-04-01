import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiCamera } from 'react-icons/fi';

/** Shimmer skeleton card shown while the image loads */
function ImageSkeleton() {
  return (
    <div className="absolute inset-0 bg-dark-card overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s infinite',
        }}
      />
    </div>
  );
}

/** Single gallery card with lazy load + shimmer */
function GalleryCard({ item, index, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => { setLoaded(true); setError(true); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5) }}
      className="group relative overflow-hidden rounded-2xl cursor-pointer bg-dark-card border border-white/5 shadow-lg"
      style={{ aspectRatio: '1 / 1' }}
      onClick={onClick}
    >
      {/* Shimmer placeholder */}
      {!loaded && <ImageSkeleton />}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-card">
          <FiCamera className="w-8 h-8 text-gray-700" />
        </div>
      ) : (
        <img
          src={item.url}
          alt={item.caption}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`absolute inset-0 w-full h-full object-cover object-center
                      transition-all duration-500
                      group-hover:scale-110 group-hover:brightness-75
                      ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Caption overlay on hover */}
      {loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         flex flex-col justify-end p-4">
          <p className="text-white text-sm font-semibold leading-snug line-clamp-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {item.caption}
          </p>
          <p className="text-gray-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
            Klik untuk perbesar
          </p>
        </div>
      )}

      {/* Index badge */}
      {loaded && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          {index + 1}
        </div>
      )}
    </motion.div>
  );
}

export default function Gallery() {
  const { t } = useTranslation();
  const { gallery } = useData();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Only show items that have a URL
  const items = gallery.filter((g) => g.url);

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Keyboard nav
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleNext(e);
    if (e.key === 'ArrowLeft') handlePrev(e);
    if (e.key === 'Escape') setLightboxIndex(null);
  };

  // If there are no real images yet, show a tasteful empty state
  const isEmpty = items.length === 0;

  return (
    <section id="gallery" className="py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-14"
        >
          <h2 className="section-title">{t('gallery.title')}</h2>
          <p className="section-subtitle">{t('gallery.subtitle')}</p>
          {!isEmpty && (
            <p className="text-gray-600 text-sm mt-2">{items.length} foto</p>
          )}
        </motion.div>

        {isEmpty ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FiCamera className="w-9 h-9 text-primary/50" />
            </div>
            <p className="text-gray-600 text-sm">Foto galeri belum tersedia.</p>
          </div>
        ) : (
          /* ── Photo grid ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item, index) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => setLightboxIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ━━━ LIGHTBOX ━━━ */}
      <AnimatePresence>
        {lightboxIndex !== null && items[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/96 backdrop-blur-lg
                       flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxIndex(null)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20
                         flex items-center justify-center text-white transition-colors"
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Prev */}
            {items.length > 1 && (
              <button
                className="absolute left-2 sm:left-6 z-50 w-11 h-11 rounded-full bg-black/50 border border-white/10
                           hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={handlePrev}
                aria-label="Sebelumnya"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image card */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-dark-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo — fill the box, centered */}
              <div className="w-full bg-black flex items-center justify-center" style={{ maxHeight: '72vh' }}>
                <img
                  src={items[lightboxIndex].url}
                  alt={items[lightboxIndex].caption}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '72vh' }}
                />
              </div>

              {/* Caption bar */}
              <div className="px-5 py-4 flex items-center justify-between gap-4 bg-dark-card border-t border-white/10">
                <p className="text-white font-medium text-sm flex-1 leading-snug">
                  {items[lightboxIndex].caption}
                </p>
                <p className="text-gray-500 text-xs shrink-0 tabular-nums">
                  {lightboxIndex + 1} / {items.length}
                </p>
              </div>

              {/* Dot indicators */}
              {items.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-4">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === lightboxIndex ? 'bg-primary w-4' : 'bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Next */}
            {items.length > 1 && (
              <button
                className="absolute right-2 sm:right-6 z-50 w-11 h-11 rounded-full bg-black/50 border border-white/10
                           hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={handleNext}
                aria-label="Berikutnya"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
