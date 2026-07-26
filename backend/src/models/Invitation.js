const mongoose = require('mongoose');
const crypto = require('crypto');

// Niente invio email automatico (Sezione 36: "se l'invio email crea
// problemi, analizza alternative, non bloccare il progetto su un
// servizio email fragile"). Il proprietario genera un link e lo
// condivide come preferisce (WhatsApp, SMS...). Il token è comunque
// sicuro (32 byte casuali) e scade da solo.
const invitationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'technician', 'viewer'], // non si invita mai come 'owner'
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex')
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

invitationSchema.index({ workspaceId: 1, status: 1 });
// TTL: gli inviti scaduti vengono ripuliti automaticamente da MongoDB.
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Invitation', invitationSchema);
