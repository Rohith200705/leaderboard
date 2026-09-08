const { NextResponse } = require('next/server');
const connectDB = require('@/lib/mongodb');
const Team = require('@/models/Team');

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find().populate('group', 'name venue groupNumber').sort({ tribeNumber: 1 });
    return NextResponse.json(teams);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
