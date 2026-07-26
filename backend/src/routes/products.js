const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { requireMinRole } = require('../middleware/permissions');
const { list, listCategories, getOne, create, update, toggleArchived, adjust, transfer } = require('../controllers/productsController');
const { upload: uploadImage, remove: removeImage } = require('../controllers/imagesController');
const { listForProduct } = require('../controllers/movementsController');

const router = express.Router();

// Limite dimensione lato server (Sezione 34: mai fidarsi del solo
// controllo client). Il client comprime già l'immagine prima di
// inviarla, quindi 8MB è un tetto di sicurezza ampio, non il caso comune.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

router.use(requireAuth, requireWorkspace);

// Lettura: aperta a tutti i membri, incluso viewer.
router.get('/', list);
router.get('/meta/categories', listCategories);
router.get('/:id', getOne);
router.get('/:id/movements', listForProduct);

// Scrittura: tutti tranne viewer (Sezione 9: technician può gestire
// prodotti/quantità/movimenti, non solo vederli).
router.post('/', requireMinRole('technician'), create);
router.put('/:id', requireMinRole('technician'), update);
router.patch('/:id/toggle-archived', requireMinRole('technician'), toggleArchived);
router.post('/:id/adjust', requireMinRole('technician'), adjust);
router.post('/:id/transfer', requireMinRole('technician'), transfer);
router.post('/:id/images', requireMinRole('technician'), upload.single('image'), uploadImage);
router.delete('/:id/images', requireMinRole('technician'), removeImage);

module.exports = router;
