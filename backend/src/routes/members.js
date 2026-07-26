const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireWorkspace } = require('../middleware/workspace');
const { requireMinRole } = require('../middleware/permissions');
const { list, invite, revokeInvitation, updateRole, removeMember } = require('../controllers/membersController');

const router = express.Router();

router.use(requireAuth, requireWorkspace);

router.get('/', list);
router.post('/invite', requireMinRole('admin'), invite);
router.delete('/invitations/:id', requireMinRole('admin'), revokeInvitation);
router.put('/:id', requireMinRole('admin'), updateRole);
router.delete('/:id', requireMinRole('admin'), removeMember);

module.exports = router;
