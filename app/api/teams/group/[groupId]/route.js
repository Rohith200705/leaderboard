const { NextResponse } = require('next/server');
const connectDB = require('@/lib/mongodb');
const Team = require('@/models/Team');

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { groupId } = await params;
    const teams = await Team.find({ group: groupId }).sort({ tribeNumber: 1 });
    return NextResponse.json(teams);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
