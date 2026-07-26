const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { requireMinRole } = require('../middleware/permissions');
const { importJson } = require('../controllers/importController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.use(requireAuth, requireWorkspace);

router.post('/json', requireMinRole('admin'), upload.single('file'), importJson);

module.exports = router;
