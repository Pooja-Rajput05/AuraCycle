import { getProfile, getLogs } from '../../../lib/db';
import { calculateCycleState } from '../../../lib/cycleCalculator';
import { buildAnalytics } from '../../../lib/insightsEngine';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const profile = await getProfile();
    const logs = await getLogs();
    const cycleState = calculateCycleState(
      profile.lastPeriodDate,
      profile.averageCycleLength,
      profile.periodLength
    );
    const analytics = buildAnalytics(logs, profile, cycleState);

    return NextResponse.json({
      profile,
      cycleState,
      analytics,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
