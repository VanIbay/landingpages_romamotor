import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchAllData,
  addRow, updateRow, deleteRow, replaceSheet,
  castServices, castTestimonials, castFaqs,
  castRunningTexts, castBlogPosts, castGallery,
  castSettings, castMessages,
} from '../utils/googleSheets';
import {
  defaultServices,
  defaultTestimonials,
  defaultFAQs,
  defaultRunningTexts,
  defaultBlogPosts,
  defaultGallery,
  defaultSettings,
  defaultMessages,
} from '../data/defaultData';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [services, setServices] = useState(defaultServices);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [faqs, setFaqs] = useState(defaultFAQs);
  const [runningTexts, setRunningTexts] = useState(defaultRunningTexts);
  const [blogPosts, setBlogPosts] = useState(defaultBlogPosts);
  // Gallery starts EMPTY — all data comes from Google Sheets
  const [gallery, setGallery] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [messages, setMessages] = useState(defaultMessages);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ━━━ FETCH ALL DATA ON MOUNT ━━━
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    console.group('%c[DataContext] loadData()', 'color:#6ee7b7;font-weight:bold');
    console.log('APPS_SCRIPT_URL configured:', !!import.meta.env.VITE_APPS_SCRIPT_URL);

    try {
      const raw = await fetchAllData();

      if (!raw) {
        console.warn('[DataContext] No APPS_SCRIPT_URL — using local default data (gallery will be empty).');
        console.groupEnd();
        setLoading(false);
        return;
      }

      console.log('[DataContext] Raw API response keys:', Object.keys(raw));
      console.log('[DataContext] raw.gallery:', raw.gallery);

      if (raw.services) setServices(castServices(raw.services));
      if (raw.testimonials) setTestimonials(castTestimonials(raw.testimonials));
      if (raw.faqs) setFaqs(castFaqs(raw.faqs));
      if (raw.running_texts) setRunningTexts(castRunningTexts(raw.running_texts));
      if (raw.blog_posts) setBlogPosts(castBlogPosts(raw.blog_posts));

      if (raw.gallery) {
        const parsed = castGallery(raw.gallery);
        console.log('[DataContext] Gallery parsed (%d items):', parsed.length, parsed);
        setGallery(parsed);
      } else {
        console.warn('[DataContext] ⚠ raw.gallery is missing from API response! Keys found:', Object.keys(raw));
      }

      if (raw.settings) setSettings((prev) => ({ ...prev, ...castSettings(raw.settings) }));
      if (raw.messages) setMessages(castMessages(raw.messages));

      console.log('[DataContext] ✅ Data loaded successfully');
    } catch (err) {
      console.error('[DataContext] ❌ Fetch error:', err.message, err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ━━━ GENERIC CRUD HELPER ━━━
  const withSaving = async (fn) => {
    setSaving(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      console.error('[DataContext] Save error:', err);
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // ━━━ SERVICES CRUD ━━━
  const addService = (data) => withSaving(async () => {
    const item = { ...data, id: Date.now() };
    await addRow('services', item);
    setServices((prev) => [...prev, item]);
  });

  const updateService = (id, data) => withSaving(async () => {
    await updateRow('services', id, data);
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  });

  const deleteService = (id) => withSaving(async () => {
    await deleteRow('services', id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  });

  // ━━━ TESTIMONIALS CRUD ━━━
  const addTestimonial = (data) => withSaving(async () => {
    const item = { ...data, id: Date.now() };
    await addRow('testimonials', item);
    setTestimonials((prev) => [...prev, item]);
  });

  const updateTestimonial = (id, data) => withSaving(async () => {
    await updateRow('testimonials', id, data);
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  });

  const deleteTestimonial = (id) => withSaving(async () => {
    await deleteRow('testimonials', id);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  });

  // ━━━ FAQs CRUD ━━━
  const addFaq = (data) => withSaving(async () => {
    const item = { ...data, id: Date.now() };
    await addRow('faqs', item);
    setFaqs((prev) => [...prev, item]);
  });

  const updateFaq = (id, data) => withSaving(async () => {
    await updateRow('faqs', id, data);
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  });

  const deleteFaq = (id) => withSaving(async () => {
    await deleteRow('faqs', id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  });

  // ━━━ RUNNING TEXTS CRUD ━━━
  const addRunningText = (data) => withSaving(async () => {
    const item = { ...data, id: Date.now() };
    await addRow('running_texts', item);
    setRunningTexts((prev) => [...prev, item]);
  });

  const updateRunningText = (id, data) => withSaving(async () => {
    await updateRow('running_texts', id, data);
    setRunningTexts((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  });

  const deleteRunningText = (id) => withSaving(async () => {
    await deleteRow('running_texts', id);
    setRunningTexts((prev) => prev.filter((t) => t.id !== id));
  });

  // ━━━ BLOG POSTS CRUD ━━━
  const addBlogPost = (data) => withSaving(async () => {
    const item = { ...data, id: Date.now(), tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags };
    await addRow('blog_posts', item);
    const display = { ...item, tags: Array.isArray(data.tags) ? data.tags : data.tags.split(',').map((t) => t.trim()) };
    setBlogPosts((prev) => [...prev, display]);
  });

  const updateBlogPost = (id, data) => withSaving(async () => {
    const apiData = { ...data, tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags };
    await updateRow('blog_posts', id, apiData);
    const display = { ...data, tags: Array.isArray(data.tags) ? data.tags : data.tags.split(',').map((t) => t.trim()) };
    setBlogPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...display } : p)));
  });

  const deleteBlogPost = (id) => withSaving(async () => {
    await deleteRow('blog_posts', id);
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  });

  // ━━━ GALLERY CRUD ━━━
  const addGalleryItem = (data) => withSaving(async () => {
    const item = { ...data, id: Date.now() };
    await addRow('gallery', item);
    setGallery((prev) => [...prev, item]);
  });

  const deleteGalleryItem = (id) => withSaving(async () => {
    await deleteRow('gallery', id);
    setGallery((prev) => prev.filter((g) => g.id !== id));
  });

  // ━━━ SETTINGS ━━━
  const saveSettings = (data) => withSaving(async () => {
    // Convert object to key-value rows
    const rows = Object.entries(data).map(([key, value]) => ({ key, value }));
    await replaceSheet('settings', rows);
    setSettings(data);
  });

  // ━━━ MESSAGES ━━━
  const addMessage = (data) => withSaving(async () => {
    const item = { ...data, id: Date.now(), date: new Date().toISOString() };
    await addRow('messages', item);
    setMessages((prev) => [...prev, item]);
  });

  const deleteMessage = (id) => withSaving(async () => {
    await deleteRow('messages', id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  });

  const clearMessages = () => withSaving(async () => {
    await replaceSheet('messages', []);
    setMessages([]);
  });

  // ━━━ CONTEXT VALUE ━━━
  const value = {
    // Data
    services, testimonials, faqs, runningTexts,
    blogPosts, gallery, settings, messages,

    // State
    loading, saving, error,
    refreshData: loadData,

    // Services CRUD
    addService, updateService, deleteService,

    // Testimonials CRUD
    addTestimonial, updateTestimonial, deleteTestimonial,

    // FAQs CRUD
    addFaq, updateFaq, deleteFaq,

    // Running Texts CRUD
    addRunningText, updateRunningText, deleteRunningText,

    // Blog Posts CRUD
    addBlogPost, updateBlogPost, deleteBlogPost,

    // Gallery CRUD
    addGalleryItem, deleteGalleryItem,

    // Settings
    saveSettings,

    // Messages
    addMessage, deleteMessage, clearMessages,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
