import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Score from '../../../models/Score';
import Team from '../../../models/Team';
import { authMiddleware } from '../../../lib/auth';

export async function POST(req) {
  try {
    await connectDB();
    const user = authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { eventId, scores } = await req.json();

    const tribeIds = scores.map(s => s.teamId);
    const validTribes = await Team.find({ _id: { $in: tribeIds }, group: user.group });
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
    return NextResponse.json({ message: 'Scores updated', count: operations.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
