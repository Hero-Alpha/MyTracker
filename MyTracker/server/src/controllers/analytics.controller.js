const DailyLog = require('../models/DailyLog');
const User     = require('../models/User');

async function getAnalytics(req, res) {
  const period = Math.min(Number(req.query.period) || 30, 90);

  const user = await User.findById(req.userId).lean();

  const endDate = new Date();
  endDate.setUTCHours(0, 0, 0, 0);

  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - (period - 1));

  const logs = await DailyLog.find({
    userId: req.userId,
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  // Build full date array so chart has every day (nulls for missing days)
  const days = [];
  for (let i = 0; i < period; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().substring(0, 10);
    const log = logs.find(l => new Date(l.date).toISOString().substring(0, 10) === dateStr);
    days.push({
      date:          dateStr,
      calories:      log?.totals?.calories  ?? null,
      protein:       log?.totals?.protein   ?? null,
      carbs:         log?.totals?.carbs     ?? null,
      fat:           log?.totals?.fat       ?? null,
      water:         log?.water?.total      ?? null,
      weight:        log?.weight            ?? null,
      workoutStatus: log?.workout?.status   ?? null,
    });
  }

  const daysWithFood = days.filter(d => d.calories !== null);
  const avg = key => daysWithFood.length
    ? Math.round(daysWithFood.reduce((s, d) => s + (d[key] || 0), 0) / daysWithFood.length)
    : 0;

  const weightDays    = days.filter(d => d.weight !== null);
  const weightChange  = weightDays.length >= 2
    ? +(weightDays[weightDays.length - 1].weight - weightDays[0].weight).toFixed(1)
    : null;

  const workoutDays = days.filter(
    d => d.workoutStatus === 'completed' || d.workoutStatus === 'partial'
  ).length;

  res.json({
    period,
    days,
    targets:      user?.dailyTargets || {},
    averages:     { calories: avg('calories'), protein: avg('protein'), carbs: avg('carbs'), fat: avg('fat'), water: avg('water') },
    weightChange,
    workoutDays,
    daysWithData: daysWithFood.length,
  });
}

module.exports = { getAnalytics };
