const express = require('express');
const Team = require('../models/Team');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ teamNumber: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
