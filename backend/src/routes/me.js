const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { resolveActiveWorkspace } = require('../services/workspaceResolver');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user, workspace, role } = await resolveActiveWorkspace(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({
      user: { id: user._id, email: user.email, name: user.name },
      workspace: workspace ? { id: workspace._id, name: workspace.name } : null,
      role
    });
  })
);

module.exports = router;
