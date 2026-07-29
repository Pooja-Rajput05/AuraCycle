import { getLogs, addOrUpdateLog } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const logs = getLogs();
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.date) {
      return NextResponse.json({ error: "Missing required field: date" }, { status: 400 });
    }
    const updated = addOrUpdateLog(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
