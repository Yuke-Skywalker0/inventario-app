# Frontend — Inventario App

PWA React (Vite), mobile-first. Deploy previsto su Cloudflare Pages.

## Sviluppo locale

```bash
npm install
cp .env.example .env
npm run dev
```

## Build di produzione

```bash
npm run build
```

Il file `.env.production` punta già al backend reale su Render: viene usato automaticamente
da Vite durante `npm run build` (non serve configurare nulla su Cloudflare Pages a parte
i comandi di build, vedi root README).
