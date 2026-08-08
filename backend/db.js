import { connectToDatabase, Profile, Log } from './mongodb.js';

/**
 * Fetch user cycle profile details from MongoDB
 */
export async function getProfile() {
  await connectToDatabase();
  
  let profile = await Profile.findOne();
  if (!profile) {
    profile = await Profile.create({
      name: 'Sarah',
      lastPeriodDate: new Date().toISOString().split('T')[0],
      averageCycleLength: 28,
      periodLength: 5
    });
  }
  return profile;
}

/**
 * Update user cycle profile details in MongoDB
 */
export async function updateProfile(newProfile) {
  await connectToDatabase();
  
  const existing = await Profile.findOne();
  if (existing) {
    if (newProfile.name !== undefined) existing.name = newProfile.name;
    if (newProfile.phone !== undefined) existing.phone = newProfile.phone;
    if (newProfile.whatsappAlertsEnabled !== undefined) existing.whatsappAlertsEnabled = newProfile.whatsappAlertsEnabled;
    if (newProfile.lastPeriodDate !== undefined) existing.lastPeriodDate = newProfile.lastPeriodDate;
    if (newProfile.averageCycleLength !== undefined) existing.averageCycleLength = newProfile.averageCycleLength;
    if (newProfile.periodLength !== undefined) existing.periodLength = newProfile.periodLength;
    
    await existing.save();
    return existing;
  } else {
    return await Profile.create(newProfile);
  }
}

/**
 * Fetch all logged entries from MongoDB sorted by date
 */
export async function getLogs() {
  await connectToDatabase();
  return await Log.find().sort({ date: 1 });
}

/**
 * Insert or update a daily wellness log inside MongoDB
 */
export async function addOrUpdateLog(logEntry) {
  await connectToDatabase();
  
  const sanitizedEntry = {
    date: logEntry.date,
    flow: logEntry.flow !== undefined ? Number(logEntry.flow) : 0,
    symptoms: Array.isArray(logEntry.symptoms) ? logEntry.symptoms : [],
    mood: logEntry.mood !== undefined ? Number(logEntry.mood) : 0,
    sleep: logEntry.sleep !== undefined ? Number(logEntry.sleep) : 0,
    water: logEntry.water !== undefined ? Number(logEntry.water) : 0,
    completedTasks: Array.isArray(logEntry.completedTasks) ? logEntry.completedTasks : []
  };

  const updatedLog = await Log.findOneAndUpdate(
    { date: logEntry.date },
    sanitizedEntry,
    { upsert: true, new: true }
  );

  return updatedLog;
}
