import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './pages/AuthScreen';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import Locations from './pages/Locations';
import ProductDetail from './pages/ProductDetail';
import ShoppingList from './pages/ShoppingList';
import Profile from './pages/Profile';
import OfflineBadge from './components/OfflineBadge';
import ErrorBoundary from './components/ErrorBoundary';

function Gate() {
  const { status } = useAuth();

  if (status === 'loading') {
    // Breve schermata neutra mentre proviamo a ripristinare la sessione
    // esistente (refresh silenzioso) — evita il lampo della login.
    return <div className="boot-screen" aria-hidden="true" />;
  }

  if (status === 'signed-out') {
    return <AuthScreen />;
  }

  return (
    <>
      <OfflineBadge />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/prodotti/:id" element={<ProductDetail />} />
          <Route path="/ubicazioni" element={<Locations />} />
          <Route path="/da-comprare" element={<ShoppingList />} />
          <Route path="/profilo" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
