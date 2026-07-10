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

const app = express();

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
