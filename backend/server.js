import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getProfile, updateProfile, getLogs, addOrUpdateLog } from './db.js';
import { calculateCycleState } from './cycleCalculator.js';
import { buildAnalytics } from './insightsEngine.js';
import { validateProfile, validateLog, sanitizeSymptoms } from './validators.js';
import authRoutes from './authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients (local and production Vercel deployment)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Hello/Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'AuraCycle backend is active and healthy.' });
});

// Profile endpoints
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const body = req.body;
    const errors = validateProfile(body);
    if (errors.length) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const sanitized = {
      ...body,
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
      whatsappAlertsEnabled: body.whatsappAlertsEnabled !== undefined ? Boolean(body.whatsappAlertsEnabled) : true,
      lastPeriodDate: body.lastPeriodDate !== undefined ? String(body.lastPeriodDate).trim() : undefined,
      averageCycleLength: body.averageCycleLength !== undefined ? Number(body.averageCycleLength) : undefined,
      periodLength: body.periodLength !== undefined ? Number(body.periodLength) : undefined,
    };

    const updated = await updateProfile(sanitized);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Daily logs endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const body = req.body;
    const errors = validateLog(body);
    if (errors.length) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const sanitized = {
      ...body,
      symptoms: sanitizeSymptoms(body.symptoms || []),
    };

    const updated = await addOrUpdateLog(sanitized);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Insights analytics calculation
app.get('/api/insights', async (req, res) => {
  try {
    const profile = await getProfile();
    const logs = await getLogs();
    
    // Support simulationDay parameter if passed
    const simulationDay = req.query.simulationDay !== undefined ? Number(req.query.simulationDay) : null;
    
    const cycleState = calculateCycleState(
      profile.lastPeriodDate,
      profile.averageCycleLength,
      profile.periodLength,
      new Date(),
      simulationDay
    );
    
    const analytics = buildAnalytics(logs, profile, cycleState);

    res.json({
      profile,
      cycleState,
      analytics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AuraCycle backend microservice running on http://localhost:${PORT}`);
});
