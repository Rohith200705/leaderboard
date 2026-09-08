import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  groupNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  venue: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['host'], default: 'host' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
});

const teamSchema = new mongoose.Schema({
  tribeNumber: { type: Number, required: true },
  name: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const scoreSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  points: { type: Number, required: true, default: 0, min: 0, max: 100 }
});
scoreSchema.index({ team: 1, event: 1 }, { unique: true });

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const Score = mongoose.models.Score || mongoose.model('Score', scoreSchema);
