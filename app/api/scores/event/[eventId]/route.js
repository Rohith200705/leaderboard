const { NextResponse } = require('next/server');
const connectDB = require('@/lib/mongodb');
const Score = require('@/models/Score');
const { authMiddleware } = require('@/lib/auth');

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
