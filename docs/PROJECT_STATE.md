# Project State

_Ultimo aggiornamento: Fase 11 completata (CRUD Ubicazioni)._

## Fase corrente
Fase 11 (Ubicazioni: magazzini/furgoni) completata e testata (13/13 test backend, build
frontend pulita). In attesa di push + deploy + verifica su dispositivo reale prima di
procedere con Fase 12 (Prodotti).

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com — verificato online, connesso ad Atlas.
- Frontend (Cloudflare Workers/Pages): https://inventario-app.lucaai1121.workers.dev — verificato online.

## Completato
- [x] Repository, backend foundation, autenticazione completa (vedi Fase 6-7)
- [x] Frontend: scaffold Vite+React, design system a token (CSS variables)
- [x] Bottom navigation (Cerca/Ubicazioni/Da comprare/Profilo) + FAB contestuale via Outlet context
- [x] AuthContext con sessione persistente (refresh silenzioso all'avvio, access token solo in memoria)
- [x] Schermata login/registrazione funzionante contro il backend reale
- [x] Profilo con logout reale (verifica end-to-end del ciclo auth)
- [x] Badge offline persistente + ErrorBoundary globale
- [x] PWA: manifest, icone, Service Worker (offline shell, API sempre NetworkOnly)
- [x] Verificato su dispositivo reale: registrazione, login, logout, sessione persistente
- [x] Backend: CRUD ubicazioni (`GET/POST/PUT /api/locations`, `PATCH .../toggle-active`),
      scoperto per workspace, validazione pura testata (13 test automatici)
- [x] Frontend: pagina Ubicazioni reale (lista, creazione, modifica, archiviazione),
      bottom sheet riutilizzabile, card in stile "cartellino da magazzino"

## In corso
- [ ] Push del codice Fase 11 su GitHub → deploy automatico Render + Cloudflare
- [ ] Verifica su dispositivo reale: creare un magazzino e un furgone, modificarli, archiviarli
- [ ] Configurare UptimeRobot per tenere Render sempre sveglio (istruzioni date all'utente)

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (rimandata: non necessaria finché l'app è single-user)
- Fase 12-13: CRUD Prodotti + inventario per ubicazione (quantità, +/- rapido)
- Fase 14-15: Movimenti e trasferimenti
- Fase 16+: ricerca, filtri, immagini, lista da comprare, barcode/voce, offline reale (IndexedDB), ottimizzazioni PWA

## Debito tecnico
Nessuno.

## Bug noti
Nessuno. Test automatici backend: 13/13 passati. Build frontend: pulita, nessun errore.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva** (rete assente,
  CORS non configurato, backend addormentato): `restoreSession` non gestiva l'eccezione e lo
  stato restava bloccato su `loading` per sempre. Corretto in `AuthContext.jsx` e
  `api/client.js` — un errore di rete ora porta correttamente alla schermata di login.
- Aggiunto `ErrorBoundary` globale come rete di sicurezza per qualunque futuro errore di
  render non previsto (mostra un messaggio invece di uno schermo vuoto).
- **[Deploy] Cloudflare "root directory not found"**: mancava `wrangler.jsonc` (nuovo flusso
  "Workers Builds") e il campo Root directory aveva uno slash iniziale di troppo. Risolto.
- **[Deploy] `secretOrPrivateKey must have a value`**: variabili `JWT_ACCESS_SECRET`/
  `JWT_REFRESH_SECRET` mancanti su Render. Risolto impostandole.
