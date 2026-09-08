import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  tribeNumber: { type: Number, required: true },
  name: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
});

export default mongoose.models.Team || mongoose.model('Team', teamSchema);
