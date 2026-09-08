import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Score from '@/models/Score';
import Team from '@/models/Team';

export async function GET() {
  try {
    await connectDB();
    const scores = await Score.aggregate([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
      { $sort: { totalPoints: -1 } }
    ]);

    const teams = await Team.find().populate('group', 'name venue groupNumber');
    const teamMap = {};
    teams.forEach(t => { teamMap[t._id.toString()] = t; });

    const leaderboard = scores
      .filter(s => teamMap[s._id.toString()])
      .map((s, i) => ({
        rank: i + 1,
        team: teamMap[s._id.toString()],
        totalPoints: s.totalPoints
      }));

    return NextResponse.json(leaderboard);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
