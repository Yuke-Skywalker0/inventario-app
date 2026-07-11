const mongoose = require('mongoose');

const MOVEMENT_TYPES = [
  'entrata',
  'uscita',
  'rettifica',
  'trasferimento',
  'utilizzo',
  'danneggiato',
  'perso',
  'restituzione'
];

const movementSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    // Popolato solo per i trasferimenti (Fase 15)
    toLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null
    },
    type: {
      type: String,
      enum: MOVEMENT_TYPES,
      required: true
    },
    // Sempre un delta (+n / -n), mai un valore assoluto: questo è ciò
    // che rende la sincronizzazione offline sicura (vedi ADL e Fase 5).
    delta: {
      type: Number,
      required: true
    },
    quantityAfter: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: { type: String, default: '' },
    note: { type: String, default: '' },

    // Chiave di idempotenza generata dal client (UUID) prima di inviare
    // l'operazione. Se lo stesso clientOpId arriva due volte (retry di
    // rete dopo un periodo offline), il secondo tentativo viene
    // riconosciuto e ignorato grazie all'unique index sotto.
    clientOpId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

movementSchema.index({ clientOpId: 1 }, { unique: true });
movementSchema.index({ workspaceId: 1, createdAt: -1 });
movementSchema.index({ productId: 1, createdAt: -1 });

movementSchema.statics.TYPES = MOVEMENT_TYPES;

module.exports = mongoose.model('Movement', movementSchema);
