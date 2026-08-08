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
      symptom: "⚡ Menstrual Cramps",
      remedies: [
        "🔥 **Heating Pad / Hot Compress**: Place a hot water bag or heating pad on your lower abdomen for 15-20 minutes to instantly relax uterine muscles.",
        "☕ **Ginger & Tulsi Herbal Tea**: Boil fresh ginger slices and holy basil leaves in water. Drink warm for natural anti-inflammatory pain relief."
      ]
    },
    bloating: {
      symptom: "🎈 Abdominal Bloating",
      remedies: [
        "🍵 **Carom (Ajwain) & Fennel Water**: Boil 1 teaspoon of fennel (saunf) and carom seeds in water. Sip warm to quickly reduce gas and swelling.",
        "🚶‍♀️ **10-Minute Gentle Walk**: Take a light 10-15 minute walk after meals, and avoid carbonated sodas and excess salt intake."
      ]
    },
    headache: {
      symptom: "🤕 Hormonal Headache",
      remedies: [
        "💧 **Warm Lemon Water**: Drink 2 large glasses of warm water right away, as menstrual headaches are frequently triggered by dehydration.",
        "💆‍♀️ **Temple Oil Massage**: Gently massage your temples and forehead with warm almond or sesame oil, then rest in a dark, quiet room for 10 minutes."
      ]
    },
    fatigue: {
      symptom: "😴 Fatigue & Low Energy",
      remedies: [
        "🍌 **Banana & Dates Energy Boost**: Eat 1 fresh banana or 2 dates for natural potassium and healthy fruit sugars to replenish energy.",
        "🛋️ **20-Minute Rest**: Take a short 20-minute power rest in the afternoon and replace heavy caffeine with warm golden turmeric milk."
      ]
    },
    back_pain: {
      symptom: "🦴 Lower Back Pain",
      remedies: [
        "🧘‍♀️ **Child's Pose Stretch**: Perform a gentle 5-minute Child's Pose (Balasana) stretch on a yoga mat to relieve lumbar spinal pressure.",
        "🛏️ **Pillow Support**: Place a soft pillow under your knees or lower back while sleeping to maintain proper spinal alignment."
      ]
    },
    acne: {
      symptom: "✨ Hormonal Acne & Pimples",
      remedies: [
        "🌿 **Cold Ice Compress**: Gently press an ice cube wrapped in a clean cotton cloth over inflamed pimples for 2 minutes to reduce redness.",
        "🍵 **Turmeric Milk / Herbal Tea**: Sip a cup of warm milk with a pinch of organic turmeric before bedtime for its natural antibacterial properties."
      ]
    },
    mood_swings: {
      symptom: "🌊 Mood Swings & Irritability",
      remedies: [
        "🍫 **Dark Chocolate (70%+)**: Enjoy 1-2 small squares of dark chocolate to stimulate natural serotonin (the happy hormone) release.",
        "🎶 **Deep Breathing & Soothing Music**: Practice 5 minutes of slow, deep breathing while listening to calming ambient music."
      ]
    },
    cravings: {
      symptom: "🍫 Sugar & Junk Food Cravings",
      remedies: [
        "🍇 **Fresh Fruits & Roasted Makhana**: Replace processed junk food with fresh apple slices, pomegranate, or crunchy roasted lotus seeds.",
        "🥜 **Soaked Almonds & Walnuts**: Snack on 4-5 soaked almonds and walnuts. Healthy fats keep your stomach full and curb sudden sugar spikes."
      ]
    },
    nausea: {
      symptom: "🤢 Nausea & Queasiness",
      remedies: [
        "🍋 **Lemon & Black Salt Tonic**: Mix fresh lemon juice and a pinch of black salt in cool water. Sip slowly to settle an upset stomach.",
        "🌱 **Fresh Mint Leaves**: Chew 2-3 fresh mint leaves or sip mint tea to relieve morning or period-related nausea instantly."
      ]
    },
    breast_tenderness: {
      symptom: "🌸 Breast Sensitivity",
      remedies: [
        "🧊 **Gentle Cool Compress**: Apply a cool damp cloth or ice pack wrapped in a towel for 5 minutes over tender areas.",
        "👚 **Soft Cotton Innerwear**: Wear non-wired, soft, breathable cotton innerwear to minimize friction and pressure."
      ]
    }
  };

  return symptoms
    .map(s => remediesDb[s.toLowerCase()])
    .filter(Boolean);
}
