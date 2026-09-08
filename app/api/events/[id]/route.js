import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Event } from '@/lib/models';
import { authMiddleware } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await Event.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Event deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
