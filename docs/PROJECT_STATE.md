# Project State

_Ultimo aggiornamento: Fase 7 completata._

## Fase corrente
Fase 7 (Backend foundation) completata. In attesa di deploy reale (azione utente) prima di
procedere con Fase 8 (Frontend foundation).

## Stack approvato
Cloudflare Pages (frontend) · Render free (backend) · MongoDB Atlas M0 (DB) · Backblaze B2 (immagini).

## Completato
- [x] Struttura repository (`/backend`, `/frontend`, `/docs`)
- [x] Modelli dati: User, Workspace, Member, Location, Product, Movement, RefreshSession
- [x] Autenticazione completa: registrazione, login, refresh con rotazione, logout, logout globale
- [x] Sicurezza base: bcrypt, rate limiting, helmet, CORS ristretto, cookie httpOnly
- [x] Test automatici su hashing password e ciclo JWT (6/6 passati)
- [x] Endpoint di verifica: `GET /api/health`, `GET /api/me`

## In corso
- [ ] Deploy backend su Render (serve azione utente)
- [ ] Verifica end-to-end contro MongoDB Atlas reale (non testabile in sandbox, dominio bloccato)

## Mancante (prossime fasi)
- Fase 8: Frontend foundation (React + PWA shell)
- Fase 9: Integrazione autenticazione nel frontend
- Fase 10-15: Workspace/ubicazioni/prodotti/inventario/movimenti/trasferimenti (CRUD + UI)
- Fase 16+: ricerca, filtri, immagini, lista da comprare, barcode/voce, offline, PWA

## Debito tecnico
Nessuno.

## Bug noti
Nessuno (test unitari passano; test end-to-end contro Atlas reale da fare dopo il deploy).
