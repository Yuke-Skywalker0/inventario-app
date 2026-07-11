# Project State

_Ultimo aggiornamento: Fase 18 completata (Lista da comprare)._

## Fase corrente
Fase 18 completata. 51/51 test backend, build frontend pulita (77 moduli). In attesa di
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
- [x] Fase 17: Immagini prodotto (upload validato, compressione client, anche in creazione)
- [x] **Fase 18: Lista da comprare** —
      - Voci automatiche: prodotti sotto scorta minima, calcolate al volo (si "risolvono" da
        sole quando si fa rifornimento, nessuna voce da ricordarsi di rimuovere)
      - Voci manuali: aggiungibili cercando un prodotto esistente, con quantità da comprare
        opzionale; rimovibili singolarmente
      - Azione "Aggiungi al magazzino": riusa la stessa operazione atomica/idempotente già
        costruita per le quantità (`applyAdjustment`, estratta in un servizio condiviso per
        evitare duplicazione di codice tra /adjust e la lista della spesa)
- [x] 51 test automatici backend (validazione pura)

## In corso
- [ ] Push del codice su GitHub → deploy automatico
- [ ] Verifica su dispositivo reale: impostare una scorta minima su un prodotto, farlo
      scendere sotto soglia, verificare che compaia da solo in "Da comprare"; aggiungere un
      prodotto manualmente alla lista; comprare/aggiungere al magazzino da entrambi i casi

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Fase 16: Ricerca multi-campo avanzata + filtri
- Fase 19-20: Barcode/QR, voce
- Fase 21: Offline reale (IndexedDB, coda di sync) — l'idempotenza lato server è già pronta
- Fase 22+: rifiniture PWA, cronologia movimenti leggibile in UI

## Debito tecnico
- Limite 8MB upload immagine verificato solo su MIME dichiarato + dimensione.
- Cronologia movimenti esiste nel DB ma non ha ancora una schermata dedicata.

## Bug noti
Nessuno. Test automatici backend: 51/51 passati. Build frontend: pulita.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva.** Risolto.
- **[Deploy] Cloudflare "root directory not found"** (mancava wrangler.jsonc). Risolto.
- **[Deploy] `secretOrPrivateKey must have a value`** (variabili JWT mancanti). Risolto.
- **[Fase 17, pre-deploy] ACL per-oggetto su Backblaze B2** non supportata. Corretto prima del deploy.
- **[Fase 17] `ERR_INVALID_URL`**: `B2_ENDPOINT` senza schema `https://`. Corretto (ora tollerante).
- **[Warning] `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`**: mancava `trust proxy`. Aggiunto.
