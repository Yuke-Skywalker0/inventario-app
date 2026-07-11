# Project State

_Ultimo aggiornamento: Fase 17 completata (Immagini prodotto)._

## Fase corrente
Fase 17 completata: upload foto validato server-side, compressione client-side,
eliminazione/sostituzione senza file orfani. 42/42 test backend, build frontend pulita.
In attesa di: configurazione bucket Backblaze come Pubblico (azione utente, vedi sotto),
push + deploy + verifica reale.

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com
- Frontend (Cloudflare Workers): https://inventario-app.lucaai1121.workers.dev

## Completato
- [x] Fase 6-8: repository, backend, autenticazione, frontend PWA — verificato su dispositivo
- [x] Fase 11: Ubicazioni (CRUD completo)
- [x] Fase 12/13/14: Prodotti, quantità per ubicazione, movimenti automatici
- [x] Fase 15: Trasferimenti tra ubicazioni (+ pulsante "Sposta tutto")
- [x] Restyling ProductCard (thumbnail, ubicazione visibile, badge scorta)
- [x] **Fase 17: Immagini prodotto** — compressione client-side (WebP, max 1600px), upload
      validato lato server (MIME reale, limite 8MB), eliminazione automatica della foto
      precedente quando sostituita, integrazione in scheda prodotto e card di ricerca
- [x] 42 test automatici backend

## In corso — azioni utente richieste
- [ ] **Impostare il bucket Backblaze come "Public"** nella dashboard (Backblaze non supporta
      ACL per singolo file: la visibilità è decisa a livello di bucket — vedi
      docs/ARCHITECTURE.md, sezione Immagini)
- [ ] Aggiungere su Render le variabili `B2_ENDPOINT` e `B2_REGION` (nuove, prese dai
      dettagli del bucket — vedi docs/ENV_VARS.md), oltre a quelle B2 già presenti
- [ ] Push del codice su GitHub → deploy automatico
- [ ] Verifica su dispositivo reale: aggiungere una foto a un prodotto, sostituirla, eliminarla

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Fase 16: Ricerca multi-campo avanzata + filtri (chip, bottom sheet filtri)
- Fase 18: Lista da comprare (scorte basse → aggiunta automatica)
- Fase 19-20: Barcode/QR, voce
- Fase 21: Offline reale (IndexedDB, coda di sync) — l'idempotenza lato server è già pronta
- Fase 22+: rifiniture PWA, cronologia movimenti leggibile in UI

## Debito tecnico
- Limite di 8MB sull'upload immagine verificato solo lato server (non con validazione
  approfondita del contenuto byte-per-byte, solo MIME type dichiarato + dimensione) — ritenuto
  accettabile per un'app personale/pochi utenti fidati, da rivedere se cambia il contesto d'uso.
- La cronologia movimenti (Sezione 17) esiste già nel DB ma non ha ancora una schermata dedicata.

## Bug noti
Nessuno. Test automatici backend: 42/42 passati. Build frontend: pulita.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva.** Risolto.
- **[Deploy] Cloudflare "root directory not found"** (mancava wrangler.jsonc). Risolto.
- **[Deploy] `secretOrPrivateKey must have a value`** (variabili JWT mancanti su Render). Risolto.
- **[Fase 17, pre-deploy] ACL per-oggetto su Backblaze B2**: il codice iniziale tentava di
  impostare `ACL: 'public-read'` sul singolo file caricato, ma Backblaze B2 non supporta ACL
  per file (solo a livello di bucket) — avrebbe fallito con 403 su ogni upload. Trovato e
  corretto prima del deploy, grazie a verifica della documentazione ufficiale.
