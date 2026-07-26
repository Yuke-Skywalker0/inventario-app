const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { requireMinRole } = require('../middleware/permissions');
const { list, create, update, toggleActive } = require('../controllers/locationsController');

const router = express.Router();

// Ogni route qui sotto richiede utente autenticato + workspace risolto.
router.use(requireAuth, requireWorkspace);

// Sezione 9: gestione ubicazioni riservata ad admin/owner. La lettura
// resta aperta a tutti i membri (anche viewer).
router.get('/', list);
router.post('/', requireMinRole('admin'), create);
router.put('/:id', requireMinRole('admin'), update);
router.patch('/:id/toggle-active', requireMinRole('admin'), toggleActive);

module.exports = router;
