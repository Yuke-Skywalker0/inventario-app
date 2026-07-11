const mongoose = require('mongoose');

// Ruoli pensati per la Fase 10 (V1). In MVP esiste solo il ruolo 'owner',
// creato automaticamente alla registrazione, ma il modello è già pronto
// per permessi granulari futuri senza bisogno di migrazioni dei dati.
const ROLES = ['owner', 'admin', 'technician', 'viewer'];

const memberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ROLES,
      required: true,
      default: 'viewer'
    }
  },
  { timestamps: true }
);

memberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

memberSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('Member', memberSchema);
