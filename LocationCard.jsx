import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Fab from './Fab';
import './AppShell.css';

export default function AppShell() {
  // Ogni pagina figlia può registrare la propria azione FAB tramite
  // useOutletContext (vedi Locations.jsx per un esempio). Se nessuna
  // pagina la registra, il FAB semplicemente non appare (Sezione 29:
  // "non deve... mostrare troppe azioni" — meglio nessuna che una a caso).
  const [fab, setFab] = useState(null);

  return (
    <div className="app-shell">
      <main className="app-content">
        <Outlet context={{ setFab }} />
      </main>
      {fab && <Fab label={fab.label} onClick={fab.onClick} />}
      <BottomNav />
    </div>
  );
}
