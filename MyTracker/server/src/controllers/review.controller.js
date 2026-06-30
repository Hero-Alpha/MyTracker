const DailyLog  = require('../models/DailyLog');
const User      = require('../models/User');
const AIReview  = require('../models/AIReview');
const { generateWeeklyReview } = require('../services/gemini.service');

const COOLDOWN_DAYS = 7;

function withTimeout(promise, ms, msg) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);
}

async function getLatestReview(req, res) {
  try {
    const review = await AIReview.findOne({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json({ review: review || null });
  } catch (err) {
    console.error('getLatestReview error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function generateReview(req, res) {
  try {
    // 7-day cooldown check
    const last = await AIReview.findOne({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    if (last) {
      const daysSince = (Date.now() - new Date(last.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < COOLDOWN_DAYS) {
        const nextAvailable = new Date(last.createdAt);
        nextAvailable.setDate(nextAvailable.getDate() + COOLDOWN_DAYS);
        return res.status(429).json({
          message: 'Review cooldown active',
          nextAvailableAt: nextAvailable.toISOString(),
          hoursRemaining: Math.ceil((nextAvailable - Date.now()) / (1000 * 60 * 60)),
        });
      }
    }

    const user = await User.findById(req.userId).lean();
    const targets = user?.dailyTargets || {};

    const endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const logs = await DailyLog.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    const daysWithFood = logs.filter(l => l.totals?.calories > 0);
    const avg = key => daysWithFood.length
      ? Math.round(daysWithFood.reduce((s, l) => s + (l.totals?.[key] || 0), 0) / daysWithFood.length)
      : 0;

    const workoutCounts = { completed: 0, partial: 0, skipped: 0 };
    logs.forEach(l => {
      if (l.workout?.status && l.workout.status !== 'not_logged') {
        workoutCounts[l.workout.status] = (workoutCounts[l.workout.status] || 0) + 1;
      }
    });

    const weightLogs = logs.filter(l => l.weight).map(l => l.weight);
    const avgWater   = logs.length
      ? Math.round(logs.reduce((s, l) => s + (l.water?.total || 0), 0) / logs.length)
      : 0;

    const payload = {
      user: {
        name:            user?.name,
        age:             user?.age,
        gender:          user?.gender,
        heightCm:        user?.height?.unit === 'cm' ? user.height.value : Math.round((user?.height?.value || 0) * 2.54),
        currentWeightKg: user?.currentWeight,
        targetWeightKg:  user?.targetWeight,
        goal:            user?.goal,
        activityLevel:   user?.activityLevel,
      },
      targets: { calories: targets.calories, protein: targets.protein, carbs: targets.carbs, fat: targets.fat, waterMl: targets.water },
      weekSummary: {
        daysLogged:  daysWithFood.length,
        avgCalories: avg('calories'),
        avgProtein:  avg('protein'),
        avgCarbs:    avg('carbs'),
        avgFat:      avg('fat'),
        avgWaterMl:  avgWater,
        calorieAdherence: targets.calories ? `${Math.round((avg('calories') / targets.calories) * 100)}%` : 'unknown',
        proteinAdherence: targets.protein  ? `${Math.round((avg('protein')  / targets.protein)  * 100)}%` : 'unknown',
      },
      workouts:    workoutCounts,
      weightTrend: weightLogs.length >= 2
        ? { start: weightLogs[0], end: weightLogs[weightLogs.length - 1], change: +(weightLogs[weightLogs.length - 1] - weightLogs[0]).toFixed(1) }
        : weightLogs.length === 1 ? { current: weightLogs[0] } : null,
    };

    // 25s timeout — Render kills requests at 30s
    const review = await withTimeout(
      generateWeeklyReview(payload),
      25000,
      'Gemini took too long. Try again in a moment.',
    );

    const saved = await AIReview.create({ userId: req.userId, periodStart: startDate, periodEnd: endDate, payload, review });
    res.json({ review: saved });
  } catch (err) {
    console.error('generateReview error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to generate review. Try again.' });
  }
}

module.exports = { getLatestReview, generateReview };
