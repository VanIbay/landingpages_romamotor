/**
 * imageUtils.js
 * Utilities for image processing (crop, resize, compress) AND
 * hosting via Cloudinary so the final URL can be stored in Google Sheets.
 *
 * Cloudinary unsigned upload (no API secret needed in frontend):
 *   1. Daftar gratis di https://cloudinary.com
 *   2. Settings → Upload → Upload Presets → Add upload preset
 *   3. Set "Signing mode" = Unsigned, set folder = "romamotor" (optional)
 *   4. Tambahkan ke .env:
 *        VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *        VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
 */

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// ━━━ FILE READER ━━━

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ━━━ IMAGE LOADING ━━━

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ━━━ CROP + COMPRESS ━━━

/**
 * Crop and resize an image using a canvas.
 * @param {HTMLImageElement} img
 * @param {{ x, y, width, height }} crop  — in CSS px on the displayed image
 * @param {number} displayWidth
 * @param {number} displayHeight
 * @param {number} [outputWidth=800]
 * @param {number} [outputHeight=800]
 * @returns {Promise<string>} compressed JPEG data URL ≤ 2 MB
 */
export async function cropAndCompress(
  img,
  crop,
  displayWidth,
  displayHeight,
  outputWidth = 800,
  outputHeight = 800
) {
  const scaleX = img.naturalWidth / displayWidth;
  const scaleY = img.naturalHeight / displayHeight;

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  canvas.getContext('2d').drawImage(
    img,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0, 0, outputWidth, outputHeight
  );

  return compressCanvas(canvas);
}

/**
 * Quick compress without cropping; preserves aspect ratio, max 1200 px wide.
 */
export async function compressImage(src, maxWidth = 1200) {
  const img = await loadImage(src);
  const ratio = Math.min(1, maxWidth / img.naturalWidth);
  const w = Math.round(img.naturalWidth * ratio);
  const h = Math.round(img.naturalHeight * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);

  return compressCanvas(canvas);
}

/**
 * Iteratively reduce JPEG quality until output ≤ 2 MB.
 */
function compressCanvas(canvas) {
  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (getBase64Size(dataUrl) > MAX_BYTES && quality > 0.1) {
    quality = parseFloat((quality - 0.05).toFixed(2));
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  return dataUrl;
}

// ━━━ HELPERS ━━━

export function getBase64Size(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round(base64.length * 0.75);
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ━━━ CLOUDINARY UPLOAD → URL untuk Google Sheets ━━━

/**
 * Upload gambar ke Cloudinary (unsigned) dan kembalikan URL HTTPS.
 * URL ini aman disimpan ke Google Sheets (bukan base64).
 *
 * Cloudinary gratis: 25 GB storage, 25 GB bandwidth/bulan
 * Setup: https://cloudinary.com → Settings → Upload → Upload Presets → Unsigned
 *
 * Env vars yang dibutuhkan:
 *   VITE_CLOUDINARY_CLOUD_NAME   = nama cloud (e.g. dxxxxxxxx)
 *   VITE_CLOUDINARY_UPLOAD_PRESET = nama preset unsigned (e.g. romamotor_gallery)
 *
 * @param {string} base64DataUrl  data:image/jpeg;base64,… string
 * @param {string} [publicId]     Nama file di Cloudinary (optional)
 * @returns {Promise<string>}     URL HTTPS dari Cloudinary CDN
 */
export async function uploadImage(base64DataUrl, publicId = '') {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary belum dikonfigurasi.\n' +
      'Tambahkan VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET ke .env\n' +
      'Setup gratis di: https://cloudinary.com'
    );
  }

  const form = new FormData();
  form.append('file', base64DataUrl);          // Cloudinary menerima data URL langsung
  form.append('upload_preset', uploadPreset);
  form.append('folder', 'romamotor');          // Semua foto masuk folder romamotor
  if (publicId) {
    // Format: romamotor/nama_foto_timestamp
    form.append('public_id', `${publicId}_${Date.now()}`);
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary error ${res.status}: ${errText}`);
  }

  const json = await res.json();

  if (json.error) throw new Error(`Cloudinary: ${json.error.message}`);

  console.log('[uploadImage] Cloudinary response:', json.secure_url);

  // secure_url = https://res.cloudinary.com/... (always HTTPS, reliable CDN)
  return json.secure_url;
}
