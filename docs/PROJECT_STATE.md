# Project State

_Ultimo aggiornamento: Fase 8 completata._

## Fase corrente
Fase 8 (Frontend foundation) completata e verificata (build + anteprima locale contro il
backend reale su Render). In attesa di deploy su Cloudflare Pages (azione utente) prima di
procedere con Fase 9/10 (CRUD ubicazioni e prodotti).

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini).

## URL noti
- Backend (Render): https://inventario-app-k5k5.onrender.com — verificato online, connesso ad Atlas.
- Frontend (Cloudflare Pages): non ancora deployato.

## Completato
- [x] Repository, backend foundation, autenticazione completa (vedi Fase 6-7)
- [x] Frontend: scaffold Vite+React, design system a token (CSS variables)
- [x] Bottom navigation (Cerca/Ubicazioni/Da comprare/Profilo) + FAB contestuale
- [x] AuthContext con sessione persistente (refresh silenzioso all'avvio, access token solo in memoria)
- [x] Schermata login/registrazione funzionante contro il backend reale
- [x] Profilo con logout reale (verifica end-to-end del ciclo auth)
- [x] Badge offline persistente
- [x] PWA: manifest, icone (192/512/maskable/apple-touch), Service Worker (offline shell, API sempre NetworkOnly)
- [x] Build di produzione verificata (npm run build + anteprima locale)

## In corso
- [ ] Deploy frontend su Cloudflare Pages (serve azione utente)
- [ ] Aggiornare `FRONTEND_ORIGIN` su Render con l'URL reale di Cloudflare Pages (altrimenti CORS blocca le richieste)
- [ ] Test reale su smartphone (installazione PWA, login, logout)

## Mancante (prossime fasi)
- Fase 10: Workspace/permessi UI (multi-utente)
- Fase 11: CRUD Ubicazioni (magazzini/furgoni)
- Fase 12-13: CRUD Prodotti + inventario per ubicazione
- Fase 14-15: Movimenti e trasferimenti
- Fase 16+: ricerca, filtri, immagini, lista da comprare, barcode/voce, offline reale (IndexedDB), ottimizzazioni PWA

## Debito tecnico
Nessuno.

## Bug noti
Nessuno. Test automatici backend: 6/6 passati. Build frontend: pulita, nessun errore.

## Bug risolti
- **[Fase 8] Schermo nero/bianco infinito se il ripristino sessione falliva** (rete assente,
  CORS non configurato, backend addormentato): `restoreSession` non gestiva l'eccezione e lo
  stato restava bloccato su `loading` per sempre. Corretto in `AuthContext.jsx` e
  `api/client.js` — un errore di rete ora porta correttamente alla schermata di login.
- Aggiunto `ErrorBoundary` globale come rete di sicurezza per qualunque futuro errore di
  render non previsto (mostra un messaggio invece di uno schermo vuoto).
