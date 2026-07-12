const { getSignedImageUrl } = require('../config/b2');

// Ogni endpoint che ritorna uno o più prodotti passa da qui prima di
// rispondere, per aggiungere mainImageUrl (URL firmata, valida qualche
// ora). Centralizzato in un solo posto (Sezione 56: niente duplicati) così
// se in futuro cambia la strategia di storage, si cambia solo qui.
async function withImageUrl(product) {
  if (!product) return product;
  const obj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  obj.mainImageUrl = obj.mainImage ? await getSignedImageUrl(obj.mainImage) : null;
  return obj;
}

async function withImageUrls(products) {
  return Promise.all(products.map(withImageUrl));
}

module.exports = { withImageUrl, withImageUrls };
