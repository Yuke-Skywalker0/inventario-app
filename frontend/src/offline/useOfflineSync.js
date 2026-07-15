import { useEffect, useState, useCallback } from 'react';
import { queueCount } from './db';
import { syncQueue } from './sync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function useOfflineSync() {
  const online = useOnlineStatus();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(() => {
    queueCount().then(setPending).catch(() => {});
  }, []);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      await syncQueue(refreshCount);
    } finally {
      setSyncing(false);
      refreshCount();
    }
  }, [refreshCount]);

  // Al ritorno online, e all'avvio dell'app (se già online), proviamo a
  // svuotare la coda. Sezione 25: "quando torna la connessione:
  // sincronizza, esegue retry".
  useEffect(() => {
    refreshCount();
    if (online) runSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (online) runSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  return { online, pending, syncing, runSync, refreshCount };
}
