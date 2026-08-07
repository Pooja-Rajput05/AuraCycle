const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SYMPTOMS = new Set([
  'cramps',
  'headache',
  'bloating',
  'fatigue',
  'acne',
  'back_pain',
]);

export function validateDate(date) {
  if (!date || !DATE_REGEX.test(date)) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, error: 'Invalid date value' };
  }
  return { valid: true };
}

export function validateProfile(body) {
  const errors = [];

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 1 || name.length > 50) {
      errors.push('Name must be between 1 and 50 characters');
    }
  }

  if (body.lastPeriodDate !== undefined) {
    const dateCheck = validateDate(body.lastPeriodDate);
    if (!dateCheck.valid) errors.push(dateCheck.error);
  }

  if (body.averageCycleLength !== undefined) {
    const len = Number(body.averageCycleLength);
    if (!Number.isFinite(len) || len < 20 || len > 45) {
      errors.push('Cycle length must be between 20 and 45 days');
    }
  }

  if (body.periodLength !== undefined) {
    const len = Number(body.periodLength);
    if (!Number.isFinite(len) || len < 2 || len > 10) {
      errors.push('Period length must be between 2 and 10 days');
    }
  }

  return errors;
}

export function validateLog(body) {
  const errors = [];

  const dateCheck = validateDate(body.date);
  if (!dateCheck.valid) errors.push(dateCheck.error);

  if (body.flow !== undefined) {
    const flow = Number(body.flow);
    if (!Number.isInteger(flow) || flow < 0 || flow > 3) {
      errors.push('Flow must be between 0 and 3');
    }
  }

  if (body.mood !== undefined) {
    const mood = Number(body.mood);
    if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
      errors.push('Mood must be between 1 and 5');
    }
  }

  if (body.sleep !== undefined) {
    const sleep = Number(body.sleep);
    if (!Number.isFinite(sleep) || sleep < 0 || sleep > 16) {
      errors.push('Sleep must be between 0 and 16 hours');
    }
  }

  if (body.water !== undefined) {
    const water = Number(body.water);
    if (!Number.isFinite(water) || water < 0 || water > 10000) {
      errors.push('Water must be between 0 and 10000 ml');
    }
  }

  if (body.symptoms !== undefined) {
    if (!Array.isArray(body.symptoms)) {
      errors.push('Symptoms must be an array');
    } else {
      body.symptoms.forEach((symptom) => {
        const normalized = String(symptom).toLowerCase().replace(/\s+/g, '_');
        if (!VALID_SYMPTOMS.has(normalized)) {
          errors.push(`Invalid symptom: ${symptom}`);
        }
      });
    }
  }

  return errors;
}

export function sanitizeSymptoms(symptoms = []) {
  return symptoms.map((s) => String(s).toLowerCase().replace(/\s+/g, '_'));
}
