const express = require('express');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('group', 'name venue groupNumber').sort({ tribeNumber: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const teams = await Team.find({ group: req.params.groupId }).sort({ tribeNumber: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
