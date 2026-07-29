import { getProfile, updateProfile } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = getProfile();
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const updated = updateProfile(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
