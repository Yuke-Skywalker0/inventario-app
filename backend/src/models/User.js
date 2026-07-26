const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    // Quando un utente appartiene a più workspace (il proprio + quelli a
    // cui è stato invitato), questo determina quale vede di default.
    // Cambiabile dal Profilo (Fase 10).
    defaultWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
