import { useState, useRef, useEffect, useCallback } from 'react';
import { FiZoomIn, FiZoomOut, FiRotateCcw } from 'react-icons/fi';

const CROP_SIZE = 300; // fixed crop window size in px

/**
 * ImageCropper
 *
 * Shows the image draggable under a fixed square crop window.
 * The user pans + zooms the image; on confirm the visible square is returned.
 *
 * Props:
 *  - src       {string}   data URL of the image to crop
 *  - onConfirm {fn}       called with { img, cropRect, displayW, displayH }
 *  - onCancel  {fn}
 */
export default function ImageCropper({ src, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  // Scale factor: rendered width relative to natural width
  const [scale, setScale] = useState(1);
  // Top-left offset of the image element within the container
  const [pos, setPos] = useState({ x: 0, y: 0 });
  // Min scale so image always fills crop window
  const [minScale, setMinScale] = useState(0.1);

  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // ━━━ Init on image load ━━━
  const handleImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalSize({ w: nw, h: nh });

    // Initial scale: fit so the smaller side covers CROP_SIZE
    const fitScale = CROP_SIZE / Math.min(nw, nh);
    const initScale = Math.max(fitScale, 1);

    const rw = nw * initScale;
    const rh = nh * initScale;

    // Center image in container (container = CROP_SIZE + 40 padding each side = CROP_SIZE + 80)
    const containerW = CROP_SIZE + 80;
    const containerH = CROP_SIZE + 80;

    const initX = (containerW - rw) / 2;
    const initY = (containerH - rh) / 2;

    setMinScale(fitScale);
    setScale(initScale);
    setPos({ x: initX, y: initY });
    setImgLoaded(true);
  }, []);

  // ━━━ Clamp position so crop window is always covered ━━━
  const clampPos = useCallback(
    (x, y, s) => {
      const { w, h } = naturalSize;
      const rw = w * s;
      const rh = h * s;
      const containerW = CROP_SIZE + 80;
      const containerH = CROP_SIZE + 80;

      // Crop window starts at x=40, y=40 inside container
      const cropLeft = 40;
      const cropTop = 40;

      // Image right edge must not be to the left of crop right edge
      const maxX = cropLeft;
      const minX = cropLeft + CROP_SIZE - rw;
      // Image bottom edge must not be above crop bottom edge
      const maxY = cropTop;
      const minY = cropTop + CROP_SIZE - rh;

      // If image is smaller than crop (shouldn't happen with minScale), center it
      return {
        x: rw < CROP_SIZE ? (containerW - rw) / 2 : Math.min(maxX, Math.max(minX, x)),
        y: rh < CROP_SIZE ? (containerH - rh) / 2 : Math.min(maxY, Math.max(minY, y)),
      };
    },
    [naturalSize]
  );

  // ━━━ Pointer events for drag ━━━
  const onPointerDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPos((prev) => clampPos(prev.x + dx, prev.y + dy, scale));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  // ━━━ Zoom ━━━
  const zoom = (delta) => {
    setScale((prev) => {
      const next = Math.max(minScale, Math.min(prev + delta, 4));
      // Keep crop center fixed while zooming
      const cropCenterX = 40 + CROP_SIZE / 2;
      const cropCenterY = 40 + CROP_SIZE / 2;
      const ratio = next / prev;
      const newX = cropCenterX - (cropCenterX - pos.x) * ratio;
      const newY = cropCenterY - (cropCenterY - pos.y) * ratio;
      const clamped = clampPos(newX, newY, next);
      setPos(clamped);
      return next;
    });
  };

  // ━━━ Wheel zoom ━━━
  const onWheel = (e) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 0.1 : -0.1);
  };

  // Attach wheel as non-passive so we can preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  // ━━━ Reset ━━━
  const reset = () => {
    const { w, h } = naturalSize;
    if (!w) return;
    const fitScale = CROP_SIZE / Math.min(w, h);
    const initScale = Math.max(fitScale, 1);
    const rw = w * initScale;
    const rh = h * initScale;
    const containerW = CROP_SIZE + 80;
    const containerH = CROP_SIZE + 80;
    setScale(initScale);
    setPos({ x: (containerW - rw) / 2, y: (containerH - rh) / 2 });
  };

  // ━━━ Confirm: calculate crop rect in displayed-image coordinates ━━━
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !imgLoaded) return;

    // Crop window: x=40, y=40 in container space
    // Displayed image starts at pos.x, pos.y
    // Crop rect in displayed image coordinates:
    const cropX = 40 - pos.x;
    const cropY = 40 - pos.y;

    const displayedW = naturalSize.w * scale;
    const displayedH = naturalSize.h * scale;

    onConfirm({
      img,
      crop: { x: cropX, y: cropY, width: CROP_SIZE, height: CROP_SIZE },
      displayWidth: displayedW,
      displayHeight: displayedH,
    });
  };

  const containerSize = CROP_SIZE + 80;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-400 text-center">
        Geser/pinch gambar untuk mengatur posisi crop. Area dalam kotak akan disimpan.
      </p>

      {/* Crop canvas area */}
      <div
        ref={containerRef}
        className="relative select-none overflow-hidden rounded-xl border border-white/10 bg-black"
        style={{ width: containerSize, height: containerSize, cursor: imgLoaded ? 'grab' : 'default' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Dark overlay outside crop window */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Top */}
          <div className="absolute top-0 left-0 right-0 bg-black/70" style={{ height: 40 }} />
          {/* Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70" style={{ height: 40 }} />
          {/* Left */}
          <div className="absolute left-0 bg-black/70" style={{ top: 40, bottom: 40, width: 40 }} />
          {/* Right */}
          <div className="absolute right-0 bg-black/70" style={{ top: 40, bottom: 40, width: 40 }} />
          {/* Crop border */}
          <div
            className="absolute border-2 border-primary"
            style={{ top: 40, left: 40, width: CROP_SIZE, height: CROP_SIZE }}
          >
            {/* Rule-of-thirds guides */}
            <div className="absolute inset-0">
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/20" />
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/20" />
              <div className="absolute top-1/3 left-0 right-0 border-t border-white/20" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-white/20" />
            </div>
            {/* Corner handles */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos) => (
              <div
                key={pos}
                className={`absolute w-4 h-4 border-2 border-primary ${pos}`}
                style={{ margin: -1 }}
              />
            ))}
          </div>
        </div>

        {/* The actual image, positioned and scaled */}
        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
        <img
          ref={imgRef}
          src={src}
          alt="crop preview"
          onLoad={handleImgLoad}
          draggable={false}
          className="absolute"
          style={{
            left: pos.x,
            top: pos.y,
            width: naturalSize.w * scale,
            height: naturalSize.h * scale,
            userSelect: 'none',
          }}
        />

        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => zoom(-0.15)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
          title="Perkecil"
        >
          <FiZoomOut className="w-4 h-4" />
        </button>
        <input
          type="range"
          min={Math.round(minScale * 100)}
          max={400}
          value={Math.round(scale * 100)}
          onChange={(e) => {
            const next = Number(e.target.value) / 100;
            const ratio = next / scale;
            const cx = 40 + CROP_SIZE / 2;
            const cy = 40 + CROP_SIZE / 2;
            const nx = cx - (cx - pos.x) * ratio;
            const ny = cy - (cy - pos.y) * ratio;
            setScale(next);
            setPos(clampPos(nx, ny, next));
          }}
          className="w-32 accent-primary"
        />
        <button
          onClick={() => zoom(0.15)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
          title="Perbesar"
        >
          <FiZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
          title="Reset"
        >
          <FiRotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleConfirm}
          disabled={!imgLoaded}
          className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          Konfirmasi Crop
        </button>
      </div>
    </div>
  );
}
