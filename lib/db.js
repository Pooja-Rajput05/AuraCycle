import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'db.json');

const defaultData = {
  profile: {
    name: "Aria",
    lastPeriodDate: "2026-07-16",
    averageCycleLength: 28,
    periodLength: 5
  },
  logs: []
};

// Ensure directory and file exist
function initDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

export function getData() {
  try {
    initDb();
    const content = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading database file:", error);
    return defaultData;
  }
}

export function saveData(data) {
  try {
    initDb();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing to database file:", error);
    return false;
  }
}

export function getProfile() {
  const data = getData();
  return data.profile;
}

export function updateProfile(newProfile) {
  const data = getData();
  data.profile = { ...data.profile, ...newProfile };
  saveData(data);
  return data.profile;
}

export function getLogs() {
  const data = getData();
  return data.logs || [];
}

export function addOrUpdateLog(logEntry) {
  if (!logEntry.date) {
    throw new Error("Date is required to save a log entry.");
  }
  
  const data = getData();
  const logs = data.logs || [];
  
  const existingIndex = logs.findIndex(log => log.date === logEntry.date);
  
  const sanitizedEntry = {
    date: logEntry.date,
    flow: logEntry.flow !== undefined ? Number(logEntry.flow) : 0,
    symptoms: Array.isArray(logEntry.symptoms) ? logEntry.symptoms : [],
    mood: logEntry.mood !== undefined ? Number(logEntry.mood) : 0,
    sleep: logEntry.sleep !== undefined ? Number(logEntry.sleep) : 0,
    water: logEntry.water !== undefined ? Number(logEntry.water) : 0
  };

  if (existingIndex > -1) {
    // Merge existing log with new updates
    logs[existingIndex] = {
      ...logs[existingIndex],
      ...sanitizedEntry
    };
  } else {
    logs.push(sanitizedEntry);
  }
  
  // Sort logs by date ascending
  logs.sort((a, b) => new Date(a.date) - new Date(b.date));
  data.logs = logs;
  
  saveData(data);
  return sanitizedEntry;
}
