const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listMine, switchWorkspace } = require('../controllers/workspacesController');

const router = express.Router();

router.use(requireAuth);

router.get('/mine', listMine);
router.post('/switch', switchWorkspace);

module.exports = router;
