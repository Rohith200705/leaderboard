const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  tribeNumber: { type: Number, required: true },
  name: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
});

module.exports = mongoose.models.Team || mongoose.model('Team', teamSchema);
