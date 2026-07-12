const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const Product = require('../models/Product');
const { createB2Client } = require('../config/b2');
const { withImageUrl } = require('../services/imageUrlService');
const { asyncHandler } = require('../middleware/errorHandler');

const ALLOWED_MIME_TYPES = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// POST /api/products/:id/images  (multipart/form-data, campo "image")
// Sezione 22 e 34: mai fidarsi del client. Il file passa dal backend
// (non è un upload diretto via URL pre-firmata) proprio per poterne
// validare qui il tipo reale prima di scriverlo su B2.
// Il bucket resta PRIVATO (Backblaze richiede una carta di credito per i
// bucket pubblici — vedi ADL): la visualizzazione passa da un URL firmata
// a scadenza, generata da imageUrlService.js prima di ogni risposta.
const upload = asyncHandler(async (req, res) => {
  const b2 = createB2Client();
  if (!b2) {
    return res.status(503).json({ error: 'Storage immagini non configurato sul server' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Nessun file ricevuto' });
  }

  const extension = ALLOWED_MIME_TYPES[req.file.mimetype];
  if (!extension) {
    return res.status(400).json({ error: 'Formato immagine non supportato (usa JPEG, PNG o WebP)' });
  }

  const product = await Product.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }

  const key = `${req.workspaceId}/${product._id}/${crypto.randomUUID()}.${extension}`;
  const previousKey = product.mainImage;

  await b2.send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    })
  );

  product.mainImage = key;
  product.updatedBy = req.userId;
  await product.save();

  // Ripulisco la foto precedente per non accumulare file orfani sui 10GB
  // gratuiti (Sezione 22: "crescita immagini oltre il free tier"). Se la
  // cancellazione fallisce non blocchiamo la risposta: è un file orfano
  // innocuo, non un dato utente perso.
  if (previousKey && previousKey !== key) {
    b2.send(new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: previousKey })).catch(
      (err) => console.error('[images] impossibile eliminare la vecchia immagine:', err.message)
    );
  }

  res.status(201).json({ product: await withImageUrl(product) });
});

// DELETE /api/products/:id/images
const remove = asyncHandler(async (req, res) => {
  const b2 = createB2Client();
  const product = await Product.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }

  if (product.mainImage && b2) {
    await b2
      .send(new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET_NAME, Key: product.mainImage }))
      .catch((err) => console.error("[images] impossibile eliminare l'immagine:", err.message));
  }

  product.mainImage = '';
  product.updatedBy = req.userId;
  await product.save();

  res.json({ product: await withImageUrl(product) });
});

module.exports = { upload, remove };
