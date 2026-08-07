import { getProfile, updateProfile } from '../../../lib/db';
import { validateProfile } from '../../../lib/validators';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errors = validateProfile(body);

    if (errors.length) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    const sanitized = {
      ...body,
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      averageCycleLength:
        body.averageCycleLength !== undefined
          ? Number(body.averageCycleLength)
          : undefined,
      periodLength:
        body.periodLength !== undefined ? Number(body.periodLength) : undefined,
    };

    const updated = await updateProfile(sanitized);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
