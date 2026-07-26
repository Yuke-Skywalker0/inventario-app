const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Member = require('../models/Member');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('email name defaultWorkspaceId createdAt');
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    let workspace = user.defaultWorkspaceId ? await Workspace.findById(user.defaultWorkspaceId) : null;
    let role = null;
    if (workspace) {
      const member = await Member.findOne({ workspaceId: workspace._id, userId: user._id });
      role = member?.role || null;
    }

    res.json({
      user: { id: user._id, email: user.email, name: user.name },
      workspace: workspace ? { id: workspace._id, name: workspace.name } : null,
      role
    });
  })
);

module.exports = router;
