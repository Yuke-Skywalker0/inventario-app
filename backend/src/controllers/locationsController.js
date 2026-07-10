const Location = require('../models/Location');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateLocationInput } = require('../utils/validateLocationInput');

// GET /api/locations?includeInactive=true
const list = asyncHandler(async (req, res) => {
  const filter = { workspaceId: req.workspaceId };
  if (req.query.includeInactive !== 'true') {
    filter.active = true;
  }
  const locations = await Location.find(filter).sort({ createdAt: 1 });
  res.json({ locations });
});

// POST /api/locations
const create = asyncHandler(async (req, res) => {
  const result = validateLocationInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  const location = await Location.create({
    ...result.data,
    workspaceId: req.workspaceId
  });

  res.status(201).json({ location });
});

// PUT /api/locations/:id
const update = asyncHandler(async (req, res) => {
  const result = validateLocationInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  const location = await Location.findOneAndUpdate(
    { _id: req.params.id, workspaceId: req.workspaceId },
    result.data,
    { new: true }
  );

  if (!location) {
    return res.status(404).json({ error: 'Ubicazione non trovata' });
  }

  res.json({ location });
});

// PATCH /api/locations/:id/toggle-active
// Archiviazione/riattivazione (Sezione 32: mai eliminazione diretta e distruttiva).
const toggleActive = asyncHandler(async (req, res) => {
  const location = await Location.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!location) {
    return res.status(404).json({ error: 'Ubicazione non trovata' });
  }

  location.active = !location.active;
  await location.save();

  res.json({ location });
});

module.exports = { list, create, update, toggleActive };
