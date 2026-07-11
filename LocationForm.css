import { useOnlineStatus } from '../hooks/useOnlineStatus';
import './OfflineBadge.css';

export default function OfflineBadge() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="offline-badge" role="status">
      <span className="offline-dot" aria-hidden="true" />
      Sei offline — le modifiche si sincronizzano al ritorno della connessione
    </div>
  );
}
