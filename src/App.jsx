import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import GlobalLoadingOverlay from './components/common/GlobalLoadingOverlay';
import HomePage from './pages/HomePage';
import BlogDetailPage from './pages/BlogDetailPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <DataProvider>
          <BrowserRouter>
            <GlobalLoadingOverlay />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/sadux/login" element={<AdminLogin />} />
              <Route
                path="/sadux/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
