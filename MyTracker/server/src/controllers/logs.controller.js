const DailyLog = require('../models/DailyLog');
const Food = require('../models/Food');
const { computeItemNutrition, computeDayTotals } = require('../services/nutrition.service');

const VALID_MEALS = ['breakfast', 'lunch', 'dinner', 'snacks'];

function normalizeDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const EMPTY_LOG = (date) => ({
  date,
  meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
  water: { entries: [], total: 0 },
  workout: { templateId: null, templateName: null, status: 'not_logged', notes: '' },
  weight: null,
  notes: '',
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
});

async function getLog(req, res) {
  const day = normalizeDate(req.params.date);
  if (!day) return res.status(400).json({ message: 'Invalid date' });

  const log = await DailyLog.findOne({ userId: req.userId, date: day }).lean();
  res.json(log || EMPTY_LOG(day));
}

async function addMealItem(req, res) {
  const { date, meal } = req.params;
  const { foodId, quantity, unit } = req.body;

  if (!VALID_MEALS.includes(meal)) {
    return res.status(400).json({ message: 'Invalid meal type' });
  }
  if (!foodId || !quantity || !unit) {
    return res.status(400).json({ message: 'foodId, quantity and unit are required' });
  }

  const food = await Food.findById(foodId);
  if (!food) return res.status(404).json({ message: 'Food not found' });

  const nutrition = computeItemNutrition(food, Number(quantity), unit);
  const day = normalizeDate(date);

  let log = await DailyLog.findOne({ userId: req.userId, date: day });
  if (!log) {
    log = new DailyLog({ userId: req.userId, date: day });
  }

  log.meals[meal].push({ foodId: food._id, foodName: food.name, quantity: Number(quantity), unit, nutrition });
  log.totals = computeDayTotals(log.meals);
  await log.save();

  res.json(log);
}

async function removeMealItem(req, res) {
  const { date, meal, itemId } = req.params;

  if (!VALID_MEALS.includes(meal)) {
    return res.status(400).json({ message: 'Invalid meal type' });
  }

  const day = normalizeDate(date);
  const log = await DailyLog.findOne({ userId: req.userId, date: day });
  if (!log) return res.status(404).json({ message: 'Log not found' });

  const before = log.meals[meal].length;
  log.meals[meal] = log.meals[meal].filter(item => item._id.toString() !== itemId);

  if (log.meals[meal].length === before) {
    return res.status(404).json({ message: 'Item not found' });
  }

  log.totals = computeDayTotals(log.meals);
  await log.save();
  res.json(log);
}

async function addWater(req, res) {
  const { date } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  const day = normalizeDate(date);
  let log = await DailyLog.findOne({ userId: req.userId, date: day });
  if (!log) {
    log = new DailyLog({ userId: req.userId, date: day });
  }

  log.water.entries.push({ amount: Number(amount), loggedAt: new Date() });
  log.water.total += Number(amount);
  await log.save();
  res.json(log);
}

async function logWeight(req, res) {
  const { date } = req.params;
  const { weight } = req.body;

  if (!weight) return res.status(400).json({ message: 'weight is required' });

  const day = normalizeDate(date);
  let log = await DailyLog.findOne({ userId: req.userId, date: day });
  if (!log) {
    log = new DailyLog({ userId: req.userId, date: day });
  }

  log.weight = Number(weight);
  await log.save();
  res.json(log);
}

async function logWorkout(req, res) {
  const { date } = req.params;
  const { templateId, templateName, status, duration, notes } = req.body;

  if (!status) return res.status(400).json({ message: 'status is required' });

  const day = normalizeDate(date);
  let log = await DailyLog.findOne({ userId: req.userId, date: day });
  if (!log) {
    log = new DailyLog({ userId: req.userId, date: day });
  }

  log.workout = {
    templateId:   templateId   || null,
    templateName: templateName || null,
    status,
    duration:     duration     || null,
    notes:        notes        || '',
  };
  await log.save();
  res.json(log);
}

module.exports = { getLog, addMealItem, removeMealItem, addWater, logWeight, logWorkout };
