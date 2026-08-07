import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auracycle';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('Successfully connected to local MongoDB.');
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Profile Schema definition
const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: 'Sarah' },
  lastPeriodDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  averageCycleLength: { type: Number, default: 28 },
  periodLength: { type: Number, default: 5 }
}, { timestamps: true });

// Daily Wellness Log Schema definition
const LogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  flow: { type: Number, default: 0 },
  symptoms: { type: [String], default: [] },
  mood: { type: Number, default: 3 },
  sleep: { type: Number, default: 7 },
  water: { type: Number, default: 0 },
  completedTasks: { type: [String], default: [] }
}, { timestamps: true });

export const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
export const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);
