const express = require('express');
const Score = require('../models/Score');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const scores = await Score.aggregate([
      {
        $group: {
          _id: '$team',
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    const teams = await Team.find().populate('group', 'name venue groupNumber');
    const teamMap = {};
    teams.forEach(t => { teamMap[t._id.toString()] = t; });

    const leaderboard = scores
      .filter(s => teamMap[s._id.toString()])
      .map((s, i) => ({
        rank: i + 1,
        team: teamMap[s._id.toString()],
        totalPoints: s.totalPoints
      }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const scores = await Score.find({ event: req.params.eventId }).populate({
      path: 'team',
      match: { group: req.user.group }
    });
    const filtered = scores.filter(s => s.team);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', auth, async (req, res) => {
  try {
    const { eventId, scores } = req.body;

    const tribeIds = scores.map(s => s.teamId);
    const validTribes = await Team.find({ _id: { $in: tribeIds }, group: req.user.group });
    const validIds = new Set(validTribes.map(t => t._id.toString()));

    const filtered = scores.filter(s => validIds.has(s.teamId));

    const operations = filtered.map(s => ({
      updateOne: {
        filter: { team: s.teamId, event: eventId },
        update: { $set: { points: Math.min(100, Math.max(0, s.points || 0)) } },
        upsert: true
      }
    }));
    await Score.bulkWrite(operations);
    res.json({ message: 'Scores updated', count: operations.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
