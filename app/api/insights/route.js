import { getProfile } from '../../../lib/db';
import { calculateCycleState } from '../../../lib/cycleCalculator';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = getProfile();
    const cycleState = calculateCycleState(
      profile.lastPeriodDate,
      profile.averageCycleLength,
      profile.periodLength
    );
    return NextResponse.json({
      profile,
      cycleState
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
