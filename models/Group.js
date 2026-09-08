import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  groupNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  venue: { type: String, required: true }
});

export default mongoose.models.Group || mongoose.model('Group', groupSchema);
