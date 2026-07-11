const mongoose = require('mongoose');

// Solo le voci AGGIUNTE MANUALMENTE vivono qui (Sezione 24, punto 2).
// Le voci automatiche da scorta bassa (punto 1) non si salvano: si
// calcolano al volo confrontando quantità e minQuantity di ogni
// prodotto — così si "auto-risolvono" da sole quando si fa rifornimento,
// senza bisogno di ricordarsi di rimuoverle.
const shoppingListItemSchema = new mongoose.Schema(
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
      required: true
    },
    quantityToBuy: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

// Un prodotto può comparire una sola volta nella lista manuale: se lo
// riaggiungi, si aggiorna la quantità invece di duplicare la riga.
shoppingListItemSchema.index({ workspaceId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('ShoppingListItem', shoppingListItemSchema);
