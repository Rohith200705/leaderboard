import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
