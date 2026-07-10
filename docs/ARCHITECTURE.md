# Architettura

## Panoramica

```
Cloudflare Pages (frontend PWA, React)
        │  HTTPS + fetch API
        ▼
Render free web service (backend Node/Express)
        │
        ├──▶ MongoDB Atlas M0 (dati)
        └──▶ Backblaze B2 (immagini prodotto)
```

## Perché queste scelte (sintesi — vedi Architecture Decision Log completo in chat)

- **MongoDB Atlas M0**: gratis per sempre, 512MB, adatto a documenti prodotto con campi variabili.
- **Render free**: nessuna carta richiesta. Il servizio va in sleep dopo 15 minuti di inattività
  (cold start 30-60s). Questo è accettabile perché l'app è **offline-first**: la UI legge sempre
  prima da IndexedDB, quindi l'utente percepisce raramente il cold-start.
- **Cloudflare Pages**: hosting statico gratuito, banda illimitata, nessuna carta.
- **Backblaze B2** (non Cloudinary, non R2): 10GB gratis, **nessuna carta richiesta**, a differenza
  di Cloudflare R2 che richiede una carta di credito per l'attivazione anche sul free tier.

## Modello dati

Vedi gli schemi Mongoose in `backend/src/models/`. Punti chiave:

- **Quantità come fonte unica di verità**: ogni `Product` ha un array `inventory: [{locationId, quantity}]`,
  aggiornato con operazioni atomiche. I `Movement` sono un log append-only per la cronologia, non la
  fonte della quantità corrente.
- **Idempotenza**: ogni `Movement` ha un `clientOpId` univoco generato dal client *prima* di inviare
  l'operazione. Permette retry sicuri dopo un periodo offline senza duplicare gli effetti.
- **Delta, non valori assoluti**: le variazioni di quantità sono sempre `+n`/`-n`. Questo è ciò che
  rende sicura la sincronizzazione multi-utente offline (due persone che modificano lo stesso prodotto
  offline vedono i loro delta sommarsi correttamente al rientro online, senza conflitti da risolvere
  manualmente).
- **Workspace/Member pronti da subito**: anche se l'MVP è single-user, ogni utente ha già un workspace
  proprio e un record Member con ruolo `owner`. Questo evita una migrazione dati quando arriverà il
  multi-utente (Fase 10).

## Autenticazione

- Password: bcrypt (cost 12).
- Access token JWT (15 minuti), inviato via header `Authorization: Bearer`, **mai salvato in
  localStorage** (vive solo in memoria nel frontend).
- Refresh token JWT (30 giorni) in cookie **httpOnly, Secure, SameSite=None** (richiesto perché
  frontend e backend sono su domini diversi).
- Ogni refresh token è tracciato in `RefreshSession` (solo l'hash, mai in chiaro) → abilita revoca
  singola, logout globale, e in futuro una lista dispositivi senza refactor.
- Rotazione: ogni refresh invalida il token precedente ed emette una nuova coppia.
