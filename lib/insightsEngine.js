import { calculateCycleState, getPhaseDetails } from './cycleCalculator';

const MOOD_LABELS = {
  1: 'Low Energy',
  2: 'Sensitive',
  3: 'Calm',
  4: 'Energetic',
  5: 'Radiant',
};

const SYMPTOM_LABELS = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  fatigue: 'Fatigue',
  acne: 'Acne',
  back_pain: 'Back Pain',
};

function normalizeSymptom(symptom) {
  return String(symptom || '').toLowerCase().replace(/\s+/g, '_');
}

function getCycleDayForLog(logDate, profile) {
  const state = calculateCycleState(
    profile.lastPeriodDate,
    profile.averageCycleLength,
    profile.periodLength,
    new Date(logDate)
  );
  return state.cycleDay;
}

function getCycleWeek(cycleDay, cycleLength) {
  const weekSize = Math.max(1, Math.ceil(cycleLength / 4));
  return Math.min(4, Math.ceil(cycleDay / weekSize));
}

export function computeSymptomFrequency(logs) {
  const counts = {};
  logs.forEach((log) => {
    (log.symptoms || []).forEach((symptom) => {
      const key = normalizeSymptom(symptom);
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  const total = logs.length || 1;
  return Object.entries(counts)
    .map(([id, count]) => ({
      id,
      label: SYMPTOM_LABELS[id] || id.replace(/_/g, ' '),
      count,
      daysPerCycle: count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeMoodPatterns(logs, profile) {
  const weeks = { 1: [], 2: [], 3: [], 4: [] };

  logs.forEach((log) => {
    if (!log.mood) return;
    const cycleDay = getCycleDayForLog(log.date, profile);
    const week = getCycleWeek(cycleDay, profile.averageCycleLength);
    weeks[week].push(log.mood);
  });

  return [1, 2, 3, 4].map((week) => {
    const moods = weeks[week];
    const avg = moods.length
      ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length
      : 3;
    return {
      week,
      avgMood: Number(avg.toFixed(1)),
      label: MOOD_LABELS[Math.round(avg)] || 'Calm',
      sampleSize: moods.length,
    };
  });
}

export function computeWellnessStats(logs) {
  if (!logs.length) {
    return {
      avgSleep: 0,
      avgWater: 0,
      hydrationGoalDays: 0,
      loggingStreak: 0,
      totalLogs: 0,
    };
  }

  const avgSleep =
    logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length;
  const avgWater =
    logs.reduce((sum, log) => sum + (log.water || 0), 0) / logs.length;
  const hydrationGoalDays = logs.filter((log) => (log.water || 0) >= 2000).length;

  const sortedDates = [...logs]
    .map((log) => log.date)
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (sortedDates.includes(expectedStr)) {
      streak += 1;
    } else {
      break;
    }
  }

  return {
    avgSleep: Number(avgSleep.toFixed(1)),
    avgWater: Math.round(avgWater),
    hydrationGoalDays,
    loggingStreak: streak,
    totalLogs: logs.length,
  };
}

export function generatePersonalizedInsights(logs, profile, cycleState) {
  const insights = [];
  const wellness = computeWellnessStats(logs);
  const symptoms = computeSymptomFrequency(logs);
  const moodPatterns = computeMoodPatterns(logs, profile);
  const phaseDetails = getPhaseDetails(cycleState.phase);

  insights.push({
    type: 'phase',
    title: `${cycleState.phase} Phase Focus`,
    description: phaseDetails.summary,
    priority: 'high',
  });

  const lutealWeek = moodPatterns[3];
  if (lutealWeek.sampleSize > 0 && lutealWeek.avgMood < 3) {
    insights.push({
      type: 'mood',
      title: 'Luteal Mood Dip Detected',
      description:
        'Your mood tends to dip in the later part of your cycle. Prioritize rest, magnesium-rich foods, and gentle movement during this window.',
      priority: 'medium',
    });
  }

  if (wellness.avgSleep > 0 && wellness.avgSleep < 7) {
    insights.push({
      type: 'sleep',
      title: 'Sleep Needs Attention',
      description: `Your average sleep is ${wellness.avgSleep}h. Aim for 7–8 hours — hormonal balance improves with consistent rest.`,
      priority: 'medium',
    });
  }

  if (wellness.avgWater > 0 && wellness.avgWater < 1800) {
    insights.push({
      type: 'hydration',
      title: 'Hydration Below Target',
      description:
        'Staying hydrated can reduce bloating and headaches. Try setting reminders to drink water throughout the day.',
      priority: 'low',
    });
  }

  if (symptoms.length > 0) {
    const top = symptoms[0];
    insights.push({
      type: 'symptom',
      title: `Most Common: ${top.label}`,
      description: `You've logged ${top.label.toLowerCase()} ${top.count} time${top.count > 1 ? 's' : ''}. Track triggers and try phase-specific remedies on your dashboard.`,
      priority: 'medium',
    });
  }

  if (wellness.loggingStreak >= 3) {
    insights.push({
      type: 'streak',
      title: `${wellness.loggingStreak}-Day Logging Streak`,
      description:
        'Consistent tracking helps us surface more accurate patterns. Keep it up!',
      priority: 'low',
    });
  }

  return insights;
}

export function generateWellnessSuggestions(cycleState, logs, profile) {
  const phaseDetails = getPhaseDetails(cycleState.phase);
  const suggestions = [];

  suggestions.push({
    icon: 'directions_walk',
    title: 'Movement',
    description: phaseDetails.exercise,
  });

  suggestions.push({
    icon: 'restaurant',
    title: 'Nutrition',
    description: phaseDetails.diet,
  });

  const recentSymptoms = logs
    .slice(-7)
    .flatMap((log) => log.symptoms || [])
    .map(normalizeSymptom);

  if (recentSymptoms.includes('bloating')) {
    suggestions.push({
      icon: 'spa',
      title: 'Bloating Relief',
      description:
        'Try peppermint tea and a gentle walk. Reduce salt intake during your luteal phase.',
    });
  }

  if (recentSymptoms.includes('cramps')) {
    suggestions.push({
      icon: 'local_fire_department',
      title: 'Cramp Care',
      description:
        'Apply heat to your lower abdomen and consider magnesium-rich foods like dark chocolate and bananas.',
    });
  }

  const avgSleep =
    logs.length > 0
      ? logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length
      : 7;

  if (avgSleep < 7) {
    suggestions.push({
      icon: 'bedtime',
      title: 'Sleep Hygiene',
      description:
        'Wind down 45 minutes before bed. Dim screens and try a calming herbal tea during your luteal phase.',
    });
  }

  return suggestions.slice(0, 4);
}

export function computeCycleConsistency(profile, logs) {
  const periodLogs = logs.filter((log) => log.flow > 0);
  if (periodLogs.length < 2) {
    return {
      score: 85,
      label: 'Building baseline',
      cycleLength: profile.averageCycleLength,
      isConsistent: true,
    };
  }

  const gaps = [];
  for (let i = 1; i < periodLogs.length; i++) {
    const prev = new Date(periodLogs[i - 1].date);
    const curr = new Date(periodLogs[i].date);
    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diff > 0 && diff < 60) gaps.push(diff);
  }

  if (!gaps.length) {
    return {
      score: 85,
      label: 'Consistent',
      cycleLength: profile.averageCycleLength,
      isConsistent: true,
    };
  }

  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance =
    gaps.reduce((sum, gap) => sum + Math.abs(gap - avgGap), 0) / gaps.length;
  const score = Math.max(60, Math.min(100, 100 - variance * 5));

  return {
    score: Math.round(score),
    label: variance <= 2 ? 'Very consistent' : variance <= 4 ? 'Mostly consistent' : 'Variable',
    cycleLength: Math.round(avgGap) || profile.averageCycleLength,
    isConsistent: variance <= 4,
  };
}

export function buildAnalytics(logs, profile, cycleState) {
  return {
    wellness: computeWellnessStats(logs),
    symptomFrequency: computeSymptomFrequency(logs),
    moodPatterns: computeMoodPatterns(logs, profile),
    personalizedInsights: generatePersonalizedInsights(logs, profile, cycleState),
    wellnessSuggestions: generateWellnessSuggestions(cycleState, logs, profile),
    cycleConsistency: computeCycleConsistency(profile, logs),
  };
}
