const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { list, addManual, removeManual, purchase } = require('../controllers/shoppingListController');

const router = express.Router();

router.use(requireAuth, requireWorkspace);

router.get('/', list);
router.post('/', addManual);
router.delete('/:id', removeManual);
router.post('/purchase', purchase);

module.exports = router;
