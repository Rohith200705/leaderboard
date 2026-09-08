const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  points: { type: Number, required: true, default: 0, min: 0, max: 100 }
});

scoreSchema.index({ team: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);
