/**
 * Cycle Calculator helper for Menstrual Health Tracker
 */

/**
 * Calculates current cycle status based on profile details
 * @param {string} lastPeriodDate - YYYY-MM-DD
 * @param {number} cycleLength - default 28
 * @param {number} periodLength - default 5
 * @param {Date} targetDate - Date to check (defaults to today)
 */
export function calculateCycleState(lastPeriodDate, cycleLength = 28, periodLength = 5, targetDate = new Date()) {
  const start = new Date(lastPeriodDate);
  const target = new Date(targetDate);
  
  // Set times to midnight for date-only comparison
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  // Time difference in milliseconds
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If target date is before the last period date
  if (diffDays < 0) {
    // Return a dummy/pre-cycle state or predict backwards
    return {
      cycleDay: 1,
      phase: "Follicular",
      daysUntilNext: 28,
      conceptionChance: "Low",
      phaseDetails: getPhaseDetails("Follicular")
    };
  }

  // Calculate day in current cycle (1-indexed)
  const cycleDay = (diffDays % cycleLength) + 1;
  const daysUntilNext = cycleLength - cycleDay + 1;

  // Determine Cycle Phase
  let phase = "Follicular";
  let conceptionChance = "Low";

  if (cycleDay >= 1 && cycleDay <= periodLength) {
    phase = "Menstrual";
    conceptionChance = "Low";
  } else if (cycleDay > periodLength && cycleDay <= cycleLength - 16) {
    phase = "Follicular";
    conceptionChance = "Medium";
  } else if (cycleDay > cycleLength - 16 && cycleDay <= cycleLength - 12) {
    phase = "Ovulatory";
    conceptionChance = "High";
  } else {
    phase = "Luteal";
    conceptionChance = "Low";
  }

  return {
    cycleDay,
    phase,
    daysUntilNext,
    conceptionChance,
    phaseDetails: getPhaseDetails(phase)
  };
}

/**
 * Get insights and description for a phase
 */
export function getPhaseDetails(phase) {
  const details = {
    Menstrual: {
      name: "Menstrual Phase",
      range: "Days 1 - 5",
      summary: "Your uterine lining is shedding, and hormone levels (estrogen and progesterone) are at their lowest.",
      symptoms: ["Cramps", "Fatigue", "Lower Back Pain", "Low Energy"],
      exercise: "Gentle activities like yoga, stretching, and walking. Prioritize rest.",
      diet: "Iron-rich foods (spinach, lentils), warm soups, herbal teas, and anti-inflammatory spices like ginger.",
      hormones: { estrogen: "Very Low", progesterone: "Very Low" }
    },
    Follicular: {
      name: "Follicular Phase",
      range: "Days 6 - 12",
      summary: "Estrogen levels are rising to build the uterine lining. Follicle-stimulating hormone (FSH) matures eggs in the ovaries.",
      symptoms: ["Increasing Energy", "Improved Mood", "Clear Skin"],
      exercise: "Cardio workouts, strength training, and higher intensity routines. Take advantage of peak energy.",
      diet: "Fresh salads, fermented foods (kimchi, yogurt), lean proteins, and fiber to support estrogen metabolism.",
      hormones: { estrogen: "Rising", progesterone: "Low" }
    },
    Ovulatory: {
      name: "Ovulatory Phase",
      range: "Days 13 - 16",
      summary: "A surge in Luteinizing Hormone (LH) triggers the release of the egg. This is your fertile window.",
      symptoms: ["High Libido", "High Energy", "Fluid Retention", "Mild Pelvic Pinching"],
      exercise: "High-intensity interval training (HIIT), group fitness classes, and social sports. You are at peak strength.",
      diet: "Antioxidant-rich fruits (berries), cruciferous vegetables (broccoli), and healthy fats (avocado, nuts) to support egg health.",
      hormones: { estrogen: "Peak", progesterone: "Starting to rise" }
    },
    Luteal: {
      name: "Luteal Phase",
      range: "Days 17 - 28",
      summary: "Progesterone is the dominant hormone, preparing the body for potential implantation. Estrogen has a second smaller peak.",
      symptoms: ["Bloating", "Breast Tenderness", "Mood Swings", "Food Cravings", "Insomnia"],
      exercise: "Strength training at moderate intensity, swimming, Pilates. Wind down intensity as the period approaches.",
      diet: "Complex carbs (sweet potatoes, oats) to stabilize blood sugar, magnesium-rich foods (dark chocolate, bananas) to reduce PMS.",
      hormones: { estrogen: "Moderate", progesterone: "High (Drops at the end)" }
    }
  };

  return details[phase] || details["Follicular"];
}

/**
 * Predicts cycle events for a calendar view (e.g. next 3 cycles)
 * Returns array of days with their predicted status
 */
export function getCalendarPredictions(lastPeriodDate, cycleLength = 28, periodLength = 5, monthsCount = 3) {
  const predictions = [];
  const start = new Date(lastPeriodDate);
  
  // We want to predict starting from the lastPeriodDate for the next few cycles
  // Let's generate predictions for a window of cycleLength * monthsCount days
  const totalDays = cycleLength * monthsCount;
  
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const dayInCycle = (i % cycleLength) + 1;
    let type = "regular"; // regular, menstrual, fertile, fertile-peak

    if (dayInCycle >= 1 && dayInCycle <= periodLength) {
      type = "menstrual";
    } else if (dayInCycle === cycleLength - 14) {
      type = "fertile-peak";
    } else if (dayInCycle >= cycleLength - 16 && dayInCycle <= cycleLength - 12) {
      type = "fertile";
    }

    predictions.push({
      date: dateStr,
      dayInCycle,
      type
    });
  }

  return predictions;
}
