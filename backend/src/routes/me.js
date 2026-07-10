const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('email name createdAt');
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    const workspace = await Workspace.findOne({ ownerId: user._id });
    res.json({
      user: { id: user._id, email: user.email, name: user.name },
      workspace: workspace ? { id: workspace._id, name: workspace.name } : null
    });
  })
);

module.exports = router;
