import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import Fab from './Fab';
import './AppShell.css';

export default function AppShell() {
  const location = useLocation();
  const showFab = location.pathname === '/';

  return (
    <div className="app-shell">
      <main className="app-content">
        <Outlet />
      </main>
      {showFab && (
        <Fab
          label="Nuovo prodotto"
          onClick={() => alert('Aggiunta prodotto: arriva nella Fase 12')}
        />
      )}
      <BottomNav />
    </div>
  );
}
