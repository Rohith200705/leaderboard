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

    const teams = await Team.find();
    const teamMap = {};
    teams.forEach(t => { teamMap[t._id.toString()] = t; });

    const leaderboard = scores.map((s, i) => ({
      rank: i + 1,
      team: teamMap[s._id.toString()],
      totalPoints: s.totalPoints
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/team/:teamId', async (req, res) => {
  try {
    const scores = await Score.find({ team: req.params.teamId }).populate('event');
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const scores = await Score.find({ event: req.params.eventId }).populate('team');
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upsert', auth, async (req, res) => {
  try {
    const { teamId, eventId, points } = req.body;
    const clampedPoints = Math.min(100, Math.max(0, points || 0));
    const score = await Score.findOneAndUpdate(
      { team: teamId, event: eventId },
      { points: clampedPoints },
      { upsert: true, new: true }
    );
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', auth, async (req, res) => {
  try {
    const { eventId, scores } = req.body;
    const operations = scores.map(s => ({
      updateOne: {
        filter: { team: s.teamId, event: eventId },
        update: { $set: { points: Math.min(100, Math.max(0, s.points || 0)) } },
        upsert: true
      }
    }));
    await Score.bulkWrite(operations);
    res.json({ message: 'Scores updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
