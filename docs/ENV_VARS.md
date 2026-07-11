# Variabili ambiente

## Backend (Render)

| Nome | Servizio | Pubblica/Segreta | Dove si trova |
|---|---|---|---|
| `MONGODB_URI` | MongoDB Atlas | Segreta | Atlas → Database → Connect → Drivers |
| `JWT_ACCESS_SECRET` | interno | Segreta | generata a mano, vedi sotto |
| `JWT_REFRESH_SECRET` | interno | Segreta | generata a mano, vedi sotto |
| `JWT_ACCESS_EXPIRES` | interno | Pubblica | valore fisso: `15m` |
| `JWT_REFRESH_EXPIRES` | interno | Pubblica | valore fisso: `30d` |
| `PORT` | Render | Pubblica | Render la imposta da solo, non toccare |
| `NODE_ENV` | interno | Pubblica | `production` su Render |
| `FRONTEND_ORIGIN` | Cloudflare Pages | Pubblica | URL del sito Cloudflare Pages, es. `https://inventario-app.pages.dev` |
| `B2_KEY_ID` | Backblaze B2 | Segreta | dashboard Backblaze → App Keys (Fase 17) |
| `B2_APPLICATION_KEY` | Backblaze B2 | Segreta | dashboard Backblaze → App Keys (Fase 17) |
| `B2_BUCKET_NAME` | Backblaze B2 | Pubblica | nome del bucket creato (Fase 17) |
| `B2_ENDPOINT` | Backblaze B2 | Pubblica | dettagli bucket → campo "Endpoint", es. `https://s3.us-west-004.backblazeb2.com` |
| `B2_REGION` | Backblaze B2 | Pubblica | la parte centrale dell'endpoint, es. `us-west-004` |

**Generare i secret JWT** (esegui in locale, poi incolla il risultato su Render — non committare mai):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Esegui due volte per ottenere due valori diversi (access e refresh).

## Frontend (Cloudflare Pages)

| Nome | Pubblica/Segreta | Note |
|---|---|---|
| `VITE_API_URL` | Pubblica | URL del backend su Render, es. `https://inventario-backend.onrender.com/api` |

Nessun secret nel frontend: è codice pubblico servito al browser, non deve mai contenere chiavi.
