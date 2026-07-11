const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, refresh, logout, logoutAll } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Protezione brute-force su login/registrazione: max 20 tentativi ogni
// 15 minuti per IP. Sufficiente a fermare attacchi automatizzati senza
// disturbare un utente reale che sbaglia password un paio di volte.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppi tentativi, riprova tra qualche minuto' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', requireAuth, logoutAll);

module.exports = router;
