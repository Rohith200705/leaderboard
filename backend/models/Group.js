const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  venue: { type: String, required: true }
});

module.exports = mongoose.model('Group', groupSchema);
