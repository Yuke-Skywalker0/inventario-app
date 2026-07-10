import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  listLocations,
  createLocation,
  updateLocation,
  toggleLocationActive
} from '../api/locations';
import BottomSheet from '../components/BottomSheet';
import LocationForm from '../components/LocationForm';
import LocationCard from '../components/LocationCard';
import './Locations.css';

export default function Locations() {
  const { setFab } = useOutletContext();
  const [locations, setLocations] = useState(null); // null = ancora in caricamento
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = creazione, altrimenti oggetto da modificare
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await listLocations({ includeInactive: true });
      setLocations(data);
    } catch (err) {
      setError(err.message || 'Impossibile caricare le ubicazioni');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Registra l'azione del FAB per questa pagina: apre il form di creazione.
  // Viene ripulita all'uscita dalla pagina (torna al comportamento di Home).
  useEffect(() => {
    setFab({ label: 'Nuova ubicazione', onClick: () => openCreate() });
    return () => setFab(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  async function handleSubmit(values) {
    if (editing) {
      const updated = await updateLocation(editing._id, values);
      setLocations((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    } else {
      const created = await createLocation(values);
      setLocations((prev) => [...(prev || []), created]);
    }
    setSheetOpen(false);
    setEditing(null);
  }

  async function handleToggleActive(location) {
    const updated = await toggleLocationActive(location._id);
    setLocations((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
  }

  function handleEdit(location) {
    setEditing(location);
    setSheetOpen(true);
  }

  const visible = (locations || []).filter((l) => (showArchived ? true : l.active));

  return (
    <div className="locations-page">
      <div className="locations-header">
        <h1>Ubicazioni</h1>
        <button
          type="button"
          className="locations-filter-toggle"
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? 'Nascondi archiviate' : 'Mostra archiviate'}
        </button>
      </div>

      {locations === null && !error && (
        <div className="locations-state">Caricamento…</div>
      )}

      {error && (
        <div className="locations-state locations-state-error">
          <p>{error}</p>
          <button type="button" onClick={load}>
            Riprova
          </button>
        </div>
      )}

      {locations !== null && !error && visible.length === 0 && (
        <div className="locations-state">
          <p className="locations-empty-title">Nessuna ubicazione</p>
          <p>Aggiungi il tuo primo magazzino o furgone con il pulsante in basso.</p>
        </div>
      )}

      {locations !== null && !error && visible.length > 0 && (
        <div className="locations-list">
          {visible.map((location) => (
            <LocationCard
              key={location._id}
              location={location}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Modifica ubicazione' : 'Nuova ubicazione'}
      >
        <LocationForm
          key={editing?._id || 'new'}
          initialValue={editing}
          onSubmit={handleSubmit}
          submitLabel={editing ? 'Salva modifiche' : 'Crea ubicazione'}
        />
      </BottomSheet>
    </div>
  );
}
