const mongoose = require('mongoose');

// Quantità per singola ubicazione. Questa sotto-struttura è la fonte
// unica di verità della giacenza (vedi ADL #5 e Fase 3 del progetto):
// i movimenti vengono registrati per la cronologia, ma la quantità
// corrente vive sempre qui, aggiornata con operazioni atomiche $inc.
const inventoryEntrySchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },

    // --- Dati essenziali (inserimento rapido) ---
    title: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: 'pezzi' },
    inventory: { type: [inventoryEntrySchema], default: [] },
    mainImage: { type: String, default: '' }, // chiave oggetto su Backblaze B2

    // --- Dettagli progressivi (opzionali) ---
    description: { type: String, default: '' },
    category: { type: String, default: '', trim: true },
    subcategory: { type: String, default: '', trim: true },
    brand: { type: String, default: '', trim: true },
    model: { type: String, default: '', trim: true },
    color: { type: String, default: '', trim: true },
    size: { type: String, default: '', trim: true },
    internalCode: { type: String, default: '', trim: true },
    barcode: { type: String, default: '', trim: true },
    qrCode: { type: String, default: '', trim: true },
    purchasePrice: { type: Number, default: null },
    minQuantity: { type: Number, default: null }, // per scorte basse / lista da comprare
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] }, // chiavi oggetto aggiuntive su B2
    freeTextLocation: { type: String, default: '' }, // "scaffale blu in fondo"

    active: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Ricerca testuale su più campi (Fase 16 - Ricerca)
productSchema.index({
  title: 'text',
  category: 'text',
  subcategory: 'text',
  brand: 'text',
  model: 'text',
  color: 'text',
  tags: 'text',
  notes: 'text'
});

productSchema.index({ workspaceId: 1, archived: 1 });
productSchema.index({ workspaceId: 1, barcode: 1 });
productSchema.index({ workspaceId: 1, 'inventory.locationId': 1 });

// Campo calcolato, non salvato su DB: l'URL pubblico dell'immagine si
// costruisce a partire dalla chiave (mainImage) e dalla configurazione B2
// corrente. Se in futuro cambiasse provider di storage, basta cambiare
// questa funzione — nessuna migrazione dati necessaria.
productSchema.virtual('mainImageUrl').get(function () {
  if (!this.mainImage) return null;
  const { publicUrlFor } = require('../config/b2');
  return publicUrlFor(this.mainImage);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
