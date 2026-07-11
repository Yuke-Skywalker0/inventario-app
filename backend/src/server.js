require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const meRoutes = require('./routes/me');
const locationsRoutes = require('./routes/locations');
const productsRoutes = require('./routes/products');
const shoppingListRoutes = require('./routes/shoppingList');

const app = express();

// Render (come quasi ogni hosting) mette il backend dietro un reverse
// proxy: senza questa riga, express-rate-limit non riesce a identificare
// correttamente l'IP del chiamante dall'header X-Forwarded-For.
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Solo il dominio del frontend (Cloudflare Pages) può chiamare l'API,
// e le credenziali (cookie) sono ammesse solo per quell'origine.
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] In ascolto sulla porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[server] Impossibile avviare: connessione DB fallita', err);
    process.exit(1);
  });
