const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { list, create, update, toggleActive } = require('../controllers/locationsController');

const router = express.Router();

// Ogni route qui sotto richiede utente autenticato + workspace risolto.
router.use(requireAuth, requireWorkspace);

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id/toggle-active', toggleActive);

module.exports = router;
