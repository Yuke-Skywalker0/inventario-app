const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { list, listCategories, getOne, create, update, toggleArchived, adjust, transfer } = require('../controllers/productsController');
const { upload: uploadImage, remove: removeImage } = require('../controllers/imagesController');

const router = express.Router();

// Limite dimensione lato server (Sezione 34: mai fidarsi del solo
// controllo client). Il client comprime già l'immagine prima di
// inviarla, quindi 8MB è un tetto di sicurezza ampio, non il caso comune.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

router.use(requireAuth, requireWorkspace);

router.get('/', list);
router.get('/meta/categories', listCategories);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.patch('/:id/toggle-archived', toggleArchived);
router.post('/:id/adjust', adjust);
router.post('/:id/transfer', transfer);
router.post('/:id/images', upload.single('image'), uploadImage);
router.delete('/:id/images', removeImage);

module.exports = router;
