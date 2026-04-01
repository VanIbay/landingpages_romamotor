import { useState, useRef, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { FiPlus, FiTrash2, FiX, FiUpload, FiImage, FiEdit2, FiCheck, FiAlertCircle } from 'react-icons/fi';
import ImageCropper from './ImageCropper';
import {
  readFileAsDataURL,
  cropAndCompress,
  formatBytes,
  getBase64Size,
  uploadImage,
} from '../../utils/imageUtils';

// Upload steps
const STEP = { PICK: 'pick', CROP: 'crop', CAPTION: 'caption', UPLOADING: 'uploading' };

export default function GalleryManager() {
  const { gallery, addGalleryItem, deleteGalleryItem, saving } = useData();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(STEP.PICK);

  // Step 1 - raw file data URL
  const [rawSrc, setRawSrc] = useState(null);
  const [fileName, setFileName] = useState('gallery');

  // Step 2 - cropped result
  const [croppedDataUrl, setCroppedDataUrl] = useState(null);
  const [croppedSizeLabel, setCroppedSizeLabel] = useState('');

  // Step 3 - caption
  const [caption, setCaption] = useState('');

  // Upload error
  const [uploadError, setUploadError] = useState(null);

  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  const isCloudinaryConfigured =
    !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
    !!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // ━━━ Open / Close ━━━
  const openModal = () => {
    setStep(STEP.PICK);
    setRawSrc(null);
    setCroppedDataUrl(null);
    setCroppedSizeLabel('');
    setCaption('');
    setUploadError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // ━━━ Step 1: File selected ━━━
  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name.replace(/\.[^.]+$/, '') || 'gallery');
    const dataUrl = await readFileAsDataURL(file);
    setRawSrc(dataUrl);
    setStep(STEP.CROP);
  }, []);

  const onFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  // Drag-and-drop
  const onDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('border-primary');
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };
  const onDragOver = (e) => { e.preventDefault(); dropRef.current?.classList.add('border-primary'); };
  const onDragLeave = () => { dropRef.current?.classList.remove('border-primary'); };

  // ━━━ Step 2: Crop confirmed ━━━
  const handleCropConfirm = async ({ img, crop, displayWidth, displayHeight }) => {
    const dataUrl = await cropAndCompress(img, crop, displayWidth, displayHeight, 800, 800);
    const bytes = getBase64Size(dataUrl);
    setCroppedDataUrl(dataUrl);
    setCroppedSizeLabel(formatBytes(bytes));
    setStep(STEP.CAPTION);
  };

  // ━━━ Step 3: Save ━━━
  const handleSave = async () => {
    if (!caption.trim()) return;
    if (!croppedDataUrl) return;

    setUploadError(null);
    setStep(STEP.UPLOADING);

    try {
      let url;

      if (isCloudinaryConfigured) {
        // Upload ke Cloudinary → dapat URL HTTPS → simpan ke Google Sheets
        const safeName = caption.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 40) || 'foto';
        url = await uploadImage(croppedDataUrl, safeName);
      } else {
        // Fallback: simpan sebagai data URL (lokal, tanpa Cloudinary)
        url = croppedDataUrl;
      }

      await addGalleryItem({ url, caption: caption.trim() });
      closeModal();
    } catch (err) {
      setUploadError(err.message);
      setStep(STEP.CAPTION);
    }
  };

  // ━━━ Delete ━━━
  const handleDelete = async (id) => {
    if (!window.confirm('Hapus foto ini dari galeri?')) return;
    try {
      await deleteGalleryItem(id);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  // ━━━ Step header labels ━━━
  const stepLabel = {
    [STEP.PICK]: '1. Pilih Foto',
    [STEP.CROP]: '2. Atur Crop',
    [STEP.CAPTION]: '3. Caption & Simpan',
    [STEP.UPLOADING]: 'Mengupload…',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mt-0.5">
            {gallery.length} foto · Foto dihosting di ImgBB, URL disimpan ke Google Sheets
          </p>
        </div>
        <button onClick={openModal} className="btn-primary !py-2 !px-4 flex items-center gap-2 text-sm">
          <FiPlus className="w-4 h-4" /> Tambah Foto
        </button>
      </div>

      {/* Cloudinary setup warning */}
      {!isCloudinaryConfigured && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <FiAlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-amber-300 font-medium">Cloudinary belum dikonfigurasi</p>
            <p className="text-amber-400/70 mt-0.5">
              Foto akan disimpan lokal saja. Daftar gratis di{' '}
              <a href="https://cloudinary.com" target="_blank" rel="noreferrer" className="underline">cloudinary.com</a>
              {' '}lalu tambahkan{' '}
              <code className="bg-white/10 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME</code> dan{' '}
              <code className="bg-white/10 px-1 rounded">VITE_CLOUDINARY_UPLOAD_PRESET</code> ke .env
            </p>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div
          className="border-2 border-dashed border-white/10 rounded-2xl p-16 text-center cursor-pointer hover:border-primary/40 transition-colors"
          onClick={openModal}
        >
          <FiImage className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Belum ada foto. Klik untuk menambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {gallery.map((item, idx) => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-dark-card border border-white/5">
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <FiImage className="w-8 h-8 text-gray-600" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={saving}
                  className="p-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Caption bar */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white text-xs font-medium truncate">{item.caption}</p>
                <p className="text-gray-500 text-[10px]">#{idx + 1}</p>
              </div>
            </div>
          ))}

          {/* Add more tile */}
          <button
            onClick={openModal}
            className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <FiPlus className="w-6 h-6" />
            <span className="text-xs">Tambah</span>
          </button>
        </div>
      )}

      {/* ━━━ MODAL ━━━ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-dark-card rounded-2xl border border-white/10 p-6 w-full max-w-lg space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-heading font-semibold">Upload Foto Galeri</h3>
                <p className="text-xs text-primary mt-0.5">{stepLabel[step]}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Step progress */}
            <div className="flex gap-1.5">
              {[STEP.PICK, STEP.CROP, STEP.CAPTION].map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    step === STEP.UPLOADING || i <= [STEP.PICK, STEP.CROP, STEP.CAPTION].indexOf(step)
                      ? 'bg-primary'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* ── STEP 1: PICK ── */}
            {step === STEP.PICK && (
              <div
                ref={dropRef}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className="border-2 border-dashed border-white/15 rounded-xl p-10 text-center transition-colors cursor-pointer hover:border-primary/40"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-white text-sm font-medium">Drag & drop foto ke sini</p>
                <p className="text-gray-500 text-xs mt-1">atau klik untuk memilih file</p>
                <p className="text-gray-600 text-xs mt-3">JPG, PNG, WEBP — maks. input tak terbatas (akan dikompres ke ≤2 MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileInput}
                />
              </div>
            )}

            {/* ── STEP 2: CROP ── */}
            {step === STEP.CROP && rawSrc && (
              <ImageCropper
                src={rawSrc}
                onConfirm={handleCropConfirm}
                onCancel={() => setStep(STEP.PICK)}
              />
            )}

            {/* ── STEP 3: CAPTION ── */}
            {step === STEP.CAPTION && croppedDataUrl && (
              <div className="space-y-4">
                {/* Preview */}
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img src={croppedDataUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">
                      Ukuran kompres: <span className="text-white font-medium">{croppedSizeLabel}</span>
                    </p>
                    <p className="text-gray-400">
                      Resolusi: <span className="text-white font-medium">800 × 800 px</span>
                    </p>
                    {isCloudinaryConfigured ? (
                      <p className="text-green-400 text-xs flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> Upload ke Cloudinary → URL disimpan ke Sheets
                      </p>
                    ) : (
                      <p className="text-amber-400 text-xs">⚠ Cloudinary belum dikonfigurasi, disimpan lokal</p>
                    )}
                    <button
                      onClick={() => setStep(STEP.CROP)}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <FiEdit2 className="w-3 h-3" /> Edit crop
                    </button>
                  </div>
                </div>

                {/* Error */}
                {uploadError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{uploadError}</p>
                  </div>
                )}

                {/* Caption input */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium">Caption Foto *</label>
                  <input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Contoh: Suasana bengkel Roma Motor"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-primary transition-colors"
                    autoFocus
                  />
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={!caption.trim()}
                  className="btn-primary w-full !py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <FiUpload className="w-4 h-4" />
                  {isCloudinaryConfigured ? 'Upload & Simpan ke Sheet' : 'Simpan'}
                </button>
              </div>
            )}

            {/* ── STEP: UPLOADING ── */}
            {step === STEP.UPLOADING && (
              <div className="py-10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-gray-300 text-sm text-center">
                  Mengupload foto ke Cloudinary…<br />
                  <span className="text-gray-500 text-xs">lalu menyimpan URL ke Google Sheets…</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
