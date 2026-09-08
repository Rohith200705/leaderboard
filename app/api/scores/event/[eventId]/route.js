import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Score } from '@/lib/models';
import { authMiddleware } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { eventId } = await params;
    const scores = await Score.find({ event: eventId }).populate({
      path: 'team',
      match: { group: user.group }
    });
    const filtered = scores.filter(s => s.team);
    return NextResponse.json(filtered);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
