# Project State

_Ultimo aggiornamento: Fix bug upload immagini + foto anche in fase di creazione prodotto._

## Fase corrente
Fase 17 (Immagini) corretta e completata: bug di configurazione B2 risolto (endpoint senza
https://), foto ora selezionabile anche in creazione prodotto (non solo dopo). 42/42 test
backend, build frontend pulita. In attesa di push + deploy + verifica reale.

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
- [x] Fase 17: Immagini prodotto — upload validato server-side, compressione client-side
- [x] **Foto anche in creazione**: il form di nuovo prodotto ora ha un selettore foto
      opzionale in cima (Sezione 31: "foto opzionale" come primo step del flusso rapido);
      se scelta, viene caricata subito dopo la creazione del prodotto. Se l'upload fallisce
      per qualsiasi motivo, il prodotto resta comunque creato (non si perde il lavoro fatto)
      e lo si può riprovare dalla scheda prodotto, dove resta sempre modificabile
- [x] 42 test automatici backend

## In corso — azioni utente richieste
- [ ] Verificare su Render che `B2_ENDPOINT` includa `https://` (bug corrisposto: il codice
      ora lo aggiunge automaticamente se manca, ma meglio comunque avere il valore corretto)
- [ ] Push del codice su GitHub → deploy automatico
- [ ] Verifica su dispositivo reale: creare un prodotto con foto fin da subito, poi cambiarla
      dalla scheda prodotto

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Fase 16: Ricerca multi-campo avanzata + filtri
- Fase 18: Lista da comprare (scorte basse → aggiunta automatica)
- Fase 19-20: Barcode/QR, voce
- Fase 21: Offline reale (IndexedDB, coda di sync)
- Fase 22+: rifiniture PWA, cronologia movimenti leggibile in UI

## Debito tecnico
- Limite 8MB upload verificato solo su MIME dichiarato + dimensione, non sul contenuto byte
  per byte. Accettabile per uso personale/pochi utenti fidati.
- Cronologia movimenti esiste nel DB ma non ha ancora una schermata dedicata.

## Bug noti
Nessuno. Test automatici backend: 42/42 passati. Build frontend: pulita.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva.** Risolto.
- **[Deploy] Cloudflare "root directory not found"** (mancava wrangler.jsonc). Risolto.
- **[Deploy] `secretOrPrivateKey must have a value`** (variabili JWT mancanti). Risolto.
- **[Fase 17, pre-deploy] ACL per-oggetto su Backblaze B2** non supportata. Corretto prima del deploy.
- **[Fase 17] `ERR_INVALID_URL` su ogni upload**: `B2_ENDPOINT` inserito su Render senza lo
  schema `https://` mandava in crash il client S3 con un errore poco chiaro ("errore interno
  del server" lato utente). Corretto in due modi: (1) il codice ora aggiunge `https://`
  automaticamente se manca, (2) documentato meglio in ENV_VARS.md.
- **[Warning, non bloccante] `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`**: mancava `app.set('trust
  proxy', 1)`, necessario perché Render (come ogni hosting dietro reverse proxy) inoltra le
  richieste con l'header X-Forwarded-For — senza quella riga express-rate-limit non riusciva
  a identificare correttamente l'IP del chiamante. Aggiunta.
