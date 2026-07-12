# Project State

_Ultimo aggiornamento: Fix immagini — bucket privato + URL firmate (niente carta di credito)._

## Fase corrente
Corretto un problema di architettura scoperto in uso reale: Backblaze B2 richiede una carta
di credito per bucket pubblici. Passato a bucket privato + URL firmate a scadenza (6 ore),
generate dal backend. 51/51 test backend passati (il refactor non tocca la logica di
business, solo il layer di risposta). Serve verificare build frontend e fare deploy.

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini, bucket PRIVATO).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com
- Frontend (Cloudflare Workers): https://inventario-app.lucaai1121.workers.dev

## Completato
- [x] Fase 6-8, 11, 12/13/14, 15, 17, 18 (vedi versioni precedenti di questo file per il dettaglio)
- [x] **Fix immagini**: rimosso il tentativo di bucket pubblico (richiedeva carta di credito
      su Backblaze). Nuova architettura: bucket privato, `services/imageUrlService.js` genera
      un URL firmato (scadenza 6 ore) per ogni prodotto con foto, applicato centralmente in
      tutti i controller che rispondono con dati prodotto (products, images, shopping-list)

## In corso — azioni utente richieste
- [ ] **Rimettere il bucket Backblaze su "Private"** (se lo avevi già cambiato in Public/pagato)
- [ ] Push del codice su GitHub → deploy automatico
- [ ] Verifica su dispositivo reale: la foto deve finalmente comparire, non più l'icona rotta

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Fase 16: Ricerca multi-campo avanzata + filtri
- Fase 19-20: Barcode/QR, voce
- Fase 21: Offline reale (IndexedDB, coda di sync) — l'idempotenza lato server è già pronta
- Fase 22+: rifiniture PWA, cronologia movimenti leggibile in UI

## Debito tecnico
- URL firmate scadono dopo 6 ore: se un prodotto resta aperto in una scheda per più tempo,
  un refresh della pagina rigenera l'URL automaticamente (viene richiesta ad ogni fetch), non
  serve nessuna azione — segnalato solo per completezza.
- Limite 8MB upload immagine verificato solo su MIME dichiarato + dimensione.
- Cronologia movimenti esiste nel DB ma non ha ancora una schermata dedicata.

## Bug noti
Nessuno. Test automatici backend: 51/51 passati.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva.** Risolto.
- **[Deploy] Cloudflare "root directory not found"** (mancava wrangler.jsonc). Risolto.
- **[Deploy] `secretOrPrivateKey must have a value`** (variabili JWT mancanti). Risolto.
- **[Fase 17, pre-deploy] ACL per-oggetto su Backblaze B2** non supportata. Corretto prima del deploy.
- **[Fase 17] `ERR_INVALID_URL`**: `B2_ENDPOINT` senza schema `https://`. Corretto (ora tollerante).
- **[Warning] `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`**: mancava `trust proxy`. Aggiunto.
- **[Fase 17] Foto caricata ma non visualizzata ("?")**: la strategia "bucket pubblico"
  richiedeva una carta di credito su Backblaze (scoperto solo provando a pubblicare il
  bucket). Corretto passando a bucket privato + URL firmate a scadenza generate dal backend,
  centralizzate in `services/imageUrlService.js` — nessuna carta, nessun costo, come da ADL.
