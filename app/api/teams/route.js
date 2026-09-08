import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Team } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find().populate('group', 'name venue groupNumber').sort({ tribeNumber: 1 });
    return NextResponse.json(teams);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
