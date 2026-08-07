/**
 * Cycle Calculator helper for Menstrual Health Tracker
 */

/**
 * Calculates current cycle status based on profile details
 * @param {string} lastPeriodDate - YYYY-MM-DD
 * @param {number} cycleLength - default 28
 * @param {number} periodLength - default 5
 * @param {Date} targetDate - Date to check (defaults to today)
 * @param {number|null} simulationDay - Day override for presentation/simulator mode
 */
export function calculateCycleState(lastPeriodDate, cycleLength = 28, periodLength = 5, targetDate = new Date(), simulationDay = null) {
  let cycleDay;
  let daysUntilNext;

  if (simulationDay !== null && simulationDay !== undefined) {
    // Simulator Mode override
    cycleDay = Math.max(1, Math.min(cycleLength, Number(simulationDay)));
    daysUntilNext = cycleLength - cycleDay + 1;
  } else {
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
      return {
        cycleDay: 1,
        phase: "Follicular",
        daysUntilNext: cycleLength,
        conceptionChance: "Low",
        phaseDetails: getPhaseDetails("Follicular")
      };
    }

    // Calculate day in current cycle (1-indexed)
    cycleDay = (diffDays % cycleLength) + 1;
    daysUntilNext = cycleLength - cycleDay + 1;
  }

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

/**
 * Get dynamic comforting remedies for logged symptoms
 * @param {Array<string>} symptoms - List of logged symptom IDs
 * @returns {Array<Object>} List of remedy objects
 */
export function getSymptomRemedies(symptoms = []) {
  const remediesDb = {
    cramps: {
      symptom: "Cramps",
      trigger: "Prostaglandins trigger uterine contractions, temporarily reducing local blood circulation.",
      solution: "Apply a warm heating pad to your lower abdomen. Sip hot ginger or raspberry leaf infusion to relax uterine muscles, and do gentle pelvic tilts."
    },
    headache: {
      symptom: "Headache",
      trigger: "Estrogen drop before or during menstruation affects blood pressure and cerebral serotonin levels.",
      solution: "Incorporate magnesium-rich snacks (dark chocolate, pumpkin seeds), drink at least 500ml water immediately, and rest in a dark, quiet room."
    },
    bloating: {
      symptom: "Bloating",
      trigger: "Hormonal shifts (slight progesterone drops or sodium imbalances) slow digestion and cause water retention.",
      solution: "Sip dandelion root or peppermint tea to ease digestion. Avoid carbonated beverages and take a gentle 15-minute walk to encourage circulation."
    },
    fatigue: {
      symptom: "Fatigue",
      trigger: "Low hormonal levels at the start of your cycle shift your metabolism toward cell rest.",
      solution: "Prioritize an early night (target 8+ hours). Eat iron-dense foods (spinach, lentils) paired with vitamin C, and replace high-intensity workouts with resting/nap blocks."
    },
    acne: {
      symptom: "Acne",
      trigger: "Progesterone peaks stimulate oil-producing glands, clogging facial pores.",
      solution: "Wash with a gentle salicylic cleanser, avoid touching or popping blemishes to prevent inflammation, and drink spearmint tea to balance oils."
    },
    back_pain: {
      symptom: "Lower Back Pain",
      trigger: "Pelvic ligaments soften and expand due to inflammatory signals associated with uterine shedding.",
      solution: "Adopt a child's pose or cat-cow stretch to extend your lumbar spine. A warm bath infused with Epsom salts will help soothe the soreness."
    }
  };

  return symptoms
    .map(s => remediesDb[s.toLowerCase()])
    .filter(Boolean);
}
