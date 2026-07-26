import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './pages/AuthScreen';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import Locations from './pages/Locations';
import ProductDetail from './pages/ProductDetail';
import ShoppingList from './pages/ShoppingList';
import Profile from './pages/Profile';
import Team from './pages/Team';
import AcceptInvite from './pages/AcceptInvite';
import OfflineBadge from './components/OfflineBadge';
import ErrorBoundary from './components/ErrorBoundary';

function Gate() {
  const { status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isInviteRoute = location.pathname.startsWith('/invito/');

  // Dopo un login/registrazione fatti per accettare un invito (Sezione
  // 36), si riprende automaticamente da dove si era interrotto invece di
  // finire semplicemente sulla home.
  useEffect(() => {
    if (status === 'signed-in' && !isInviteRoute) {
      const pending = sessionStorage.getItem('pendingInviteToken');
      if (pending) {
        navigate(`/invito/${pending}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // La pagina di invito funziona sia da autenticati che da anonimi
  // (gestisce internamente entrambi i casi): deve restare raggiungibile
  // prima ancora di sapere se l'utente è loggato.
  if (isInviteRoute) {
    return (
      <Routes>
        <Route path="/invito/:token" element={<AcceptInvite />} />
      </Routes>
    );
  }

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
          <Route path="/team" element={<Team />} />
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
