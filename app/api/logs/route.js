import { getLogs, addOrUpdateLog } from '../../../lib/db';
import { validateLog, sanitizeSymptoms } from '../../../lib/validators';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const logs = await getLogs();
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errors = validateLog(body);

    if (errors.length) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    const sanitized = {
      ...body,
      symptoms: sanitizeSymptoms(body.symptoms || []),
    };

    const updated = await addOrUpdateLog(sanitized);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
