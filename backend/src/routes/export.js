const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { exportJson, exportCsv } = require('../controllers/exportController');

const router = express.Router();

router.use(requireAuth, requireWorkspace);

router.get('/json', exportJson);
router.get('/csv', exportCsv);

module.exports = router;
