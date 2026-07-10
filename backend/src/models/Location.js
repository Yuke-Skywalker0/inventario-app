const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['magazzino', 'furgone', 'deposito', 'garage', 'altro'],
      default: 'altro'
    },
    description: { type: String, default: '' },
    address: { type: String, default: '' },
    icon: { type: String, default: '' },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

locationSchema.index({ workspaceId: 1, active: 1 });

module.exports = mongoose.model('Location', locationSchema);
