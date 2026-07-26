const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { preview, accept } = require('../controllers/invitationsController');

const router = express.Router();

router.get('/:token', preview);
router.post('/:token/accept', requireAuth, accept);

module.exports = router;
