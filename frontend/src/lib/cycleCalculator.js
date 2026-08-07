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
        "🔥 **Garam Patti / Hot Water Bag**: Lower abdomen par 15-20 min garam paani ki botal ya heating pad rakhein, isse muscles turant relax hongi.",
        "☕ **Adrak aur Tulsi ki Chai**: Garam paani me thodi adrak aur tulsi ubaal kar peeyin, isse dard me bohot aaram milega."
      ]
    },
    bloating: {
      symptom: "🎈 Bloating / Pet Phulna",
      remedies: [
        "🍵 **Ajwain & Saunf Paani**: 1 chammach saunf aur ajwain ko ubaal kar gunguna paani peeyin, gas aur pet ki sujan turant kam hogi.",
        "🚶‍♀️ **10-Min Soft Walk**: Khane ke baad 10-15 minute halki walk karein, carbonated cold drinks aur zyada namak avoid karein."
      ]
    },
    headache: {
      symptom: "🤕 Sir Dard / Headache",
      remedies: [
        "💧 **Gunguna Paani & Nimbu**: Pehle 2 glass gunguna paani peeyin kyunki sir dard aksar dehydration ki wajah se hota hai.",
        "💆‍♀️ **Teel / Badam Oil Massage**: Kankhi aur sar par halki badam ya til ke tel se massage karke 10 min aakhein band karke soyein."
      ]
    },
    fatigue: {
      symptom: "😴 Thakan / Low Energy",
      remedies: [
        "🍌 **Kela aur Khajur (Banana & Dates)**: Natural sugar aur potassium ke liye 1 kela ya 2 khajur khayein, instant energy milegi.",
        "🛋️ **20-Min Power Nap**: Shaam ko 20 minute ki shanti se nap lein aur chai/coffee ki jagah halka gunguna doodh peeyin."
      ]
    },
    back_pain: {
      symptom: "🦴 Kamar Dard / Back Pain",
      remedies: [
        "🧘‍♀️ **Child's Pose (Balasana)**: Zameen par ghutne mod kar aage jhukne wali stretch (Child's Pose) 5 min karein.",
        "🛏️ **Kamar ke niche Takiya**: Sote waqt kamar ya ghutno ke niche takiya (pillow) lagayein taaki spine par pressure kam ho."
      ]
    },
    acne: {
      symptom: "✨ Pimples / Acne",
      remedies: [
        "🌿 **Neem / Neem Water Cleanse**: Chehre ko thande paani se dhoyin, face par barf (ice cube) rumaal me lapet kar 2 min lagayein.",
        "🍵 **Haldi-Doodh / Spearmint Tea**: Raat ko gungune doodh me ek chutki haldi mila kar peeyin, skin inflammation kam hogi."
      ]
    },
    mood_swings: {
      symptom: "🌊 Mood Swings / Chidchidapan",
      remedies: [
        "🍫 **Dark Chocolate (70%+)**: 1-2 small piece dark chocolate khayein, isse serotonin (happy hormone) release hota hai.",
        "🎶 **Music & Deep Breathing**: 5 min ke liye lambi gehri saas lein (Inhale-Exhale) aur apna favorite soothing music suneyin."
      ]
    },
    cravings: {
      symptom: "🍫 Cravings / Meetha Khane ka Man",
      remedies: [
        "🍇 **Meethe Phal (Fruits) & Makhane**: Unhealthy junk food ki jagah seb, anar ya roasted makhane khayein.",
        "🥜 **Badam & Akhrot (Nuts)**: 4-5 bhige hue badam aur akhrot khayein, isse stomach full rahega aur craving shant hogi."
      ]
    },
    nausea: {
      symptom: "🤢 Ji Machlana / Nausea",
      remedies: [
        "🍋 **Nimbu-Kala Namak**: Ek glass thande paani me thoda nimbu aur kala namak mila kar sip-sip karke peeyin.",
        "🌱 **Pudina (Mint) Leaves**: 2-3 pudine ki pattiya chabayein ya unka ras peeyin, ulti jaisa lagna turant band hoga."
      ]
    },
    breast_tenderness: {
      symptom: "🌸 Chest / Breast Sensitivity",
      remedies: [
        "🧊 **Cold Compress**: Rumaal me barf lapet kar 5 min halki sekai karein.",
        "👚 **Soft Supportive Bra**: Tight bra avoid karein aur soft cotton comfortable innerwear pehnein."
      ]
    }
  };

  return symptoms
    .map(s => remediesDb[s.toLowerCase()])
    .filter(Boolean);
}
