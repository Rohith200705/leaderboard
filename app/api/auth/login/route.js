import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    const user = await User.findOne({ email }).populate('group');
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });

    const token = jwt.sign(
      { id: user._id, role: user.role, group: user.group._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      user: {
        email: user.email,
        role: user.role,
        group: {
          id: user.group._id.toString(),
          name: user.group.name,
          venue: user.group.venue,
          groupNumber: user.group.groupNumber
        }
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
