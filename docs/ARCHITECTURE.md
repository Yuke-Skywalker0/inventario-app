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
- Refresh token JWT in cookie **httpOnly, Secure, SameSite=None**. Durata legata alla scelta
  "Ricordami" fatta al login: **90 giorni** (cookie persistente) se attiva, altrimenti cookie
  di sessione (nessun `maxAge` — sparisce alla chiusura del browser/app) con token JWT di 1
  giorno come rete di sicurezza aggiuntiva. La preferenza viene mantenuta anche quando il
  token si rinnova (rotazione), leggendola dalla sessione precedente.
- Ogni refresh token è tracciato in `RefreshSession` (solo l'hash, mai in chiaro) → abilita revoca
  singola, logout globale, e in futuro una lista dispositivi senza refactor.
- Rotazione: ogni refresh invalida il token precedente ed emette una nuova coppia.

## Immagini (Backblaze B2)

Le foto vengono compresse **nel browser** prima dell'invio (ridimensionate a un massimo di
1600px sul lato lungo, convertite in WebP qualità 0.82 — rimuove anche i dati EXIF) e poi
caricate attraverso il backend (non con URL pre-firmate dirette): questo permette una vera
validazione server-side del tipo di file, invece di fidarsi solo del client (Sezione 34).

**Bucket privato, URL firmate a scadenza.** Backblaze B2 richiede una carta di credito per
abilitare bucket pubblici (anche se l'addebito iniziale è minimo e accreditato sul saldo) —
esattamente lo stesso problema per cui avevamo scartato Cloudflare R2. Per restare a 0€ senza
carta, il bucket resta **privato** e il backend genera un **URL firmato** (valido 6 ore) ogni
volta che un prodotto con foto viene restituito da un endpoint (`services/imageUrlService.js`,
usato da tutti i controller che rispondono con dati prodotto). Questo ha anche un vantaggio
di sicurezza in più: le foto non sono permanentemente accessibili a chiunque abbia il link.

Sostituendo una foto, quella precedente viene eliminata da B2 per non accumulare file orfani
sui 10GB gratuiti.

## Uptime (keep-alive backend)

Render free va in sleep dopo 15 minuti di inattività. Per eliminare questo comportamento è
stato aggiunto **UptimeRobot** (piano gratuito, nessuna carta) che chiama `GET /api/health`
ogni 5 minuti. Questo consuma circa 744 delle 750 ore/mese incluse nel piano gratuito di
Render — sufficiente per tenerlo acceso 24/7 senza superare la soglia, ma senza margine per
un secondo servizio Render gratuito in futuro (da tenere presente se si aggiungeranno altri
servizi sulla stessa piattaforma).
