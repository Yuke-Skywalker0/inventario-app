# Inventario App

PWA mobile-first, offline-first, multi-magazzino, a costo 0€/mese.

## Struttura del repository

```
/backend    API Node.js/Express + MongoDB (deploy su Render)
/frontend   PWA React (deploy su Cloudflare Pages) — in costruzione, Fase 8
/docs       Documentazione di progetto e architettura
```

## Stack

- **Frontend:** React (PWA) → Cloudflare Pages
- **Backend:** Node.js/Express → Render (free tier)
- **Database:** MongoDB Atlas (M0 free)
- **Immagini:** Backblaze B2 (free tier, 10GB)

Dettagli completi delle decisioni architetturali in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Setup locale — backend

```bash
cd backend
npm install
cp .env.example .env   # poi compila i valori, vedi docs/ENV_VARS.md
npm run dev
```

Il server parte su `http://localhost:3000`. Endpoint di verifica: `GET /api/health`.

## Test

```bash
cd backend
npm test
```

## Stato del progetto

Vedi [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) per la fase corrente, le decisioni prese e cosa manca.
