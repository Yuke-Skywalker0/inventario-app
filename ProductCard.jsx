# Copia questo file in .env per lo sviluppo locale.
# NON committare mai il file .env reale (è già in .gitignore).

# --- Database ---
MONGODB_URI=mongodb+srv://utente:password@cluster.mongodb.net/inventario?retryWrites=true&w=majority

# --- Autenticazione ---
# Genera valori casuali lunghi, es: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=sostituisci_con_una_stringa_casuale_lunga
JWT_REFRESH_SECRET=sostituisci_con_unaltra_stringa_casuale_lunga
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# --- Server ---
PORT=3000
NODE_ENV=development

# --- CORS ---
# Dominio del frontend su Cloudflare Pages (in produzione), es: https://inventario-app.pages.dev
FRONTEND_ORIGIN=http://localhost:5173

# --- Backblaze B2 (Fase 17 - Immagini) ---
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_NAME=
# Copia questi due valori dalla pagina dei dettagli del tuo bucket su
# Backblaze (sezione "Endpoint"), es:
# B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
# B2_REGION=us-west-004
B2_ENDPOINT=
B2_REGION=
