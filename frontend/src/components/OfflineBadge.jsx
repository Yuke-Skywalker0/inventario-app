import { useOfflineSync } from '../offline/useOfflineSync';
import './OfflineBadge.css';

export default function OfflineBadge() {
  const { online, pending, syncing } = useOfflineSync();

  if (online && pending === 0) return null;

  return (
    <div className="offline-badge" role="status">
      <span className={`offline-dot${syncing ? ' is-syncing' : ''}`} aria-hidden="true" />
      {!online && 'Sei offline — le modifiche si sincronizzano al ritorno della connessione'}
      {online && syncing && 'Sincronizzazione in corso…'}
      {online && !syncing && pending > 0 && `${pending} modifiche in attesa di sincronizzazione`}
    </div>
  );
}
