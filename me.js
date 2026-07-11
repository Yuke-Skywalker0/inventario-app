const mongoose = require('mongoose');

// Ogni refresh token emesso viene tracciato qui (come hash, mai in chiaro).
// Questo abilita: logout singolo, logout globale, revoca, e in futuro
// (Fase 35) una lista dispositivi/sessioni attive senza dover
// ridisegnare il modello di autenticazione.
const refreshSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    userAgent: { type: String, default: '' },
    revoked: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// TTL index: MongoDB elimina automaticamente le sessioni scadute.
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshSession', refreshSessionSchema);
