const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { list, getOne, create, update, toggleArchived, adjust } = require('../controllers/productsController');

const router = express.Router();

router.use(requireAuth, requireWorkspace);

router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.patch('/:id/toggle-archived', toggleArchived);
router.post('/:id/adjust', adjust);

module.exports = router;
