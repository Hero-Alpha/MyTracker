const BodyMeasurement = require('../models/BodyMeasurement');

async function getMeasurements(req, res) {
  const measurements = await BodyMeasurement.find({ userId: req.userId })
    .sort({ date: -1 })
    .limit(12)
    .lean();
  res.json({ measurements });
}

async function getLatest(req, res) {
  const latest = await BodyMeasurement.findOne({ userId: req.userId }).sort({ date: -1 }).lean();
  res.json({ measurement: latest || null });
}

async function addMeasurement(req, res) {
  const { date, measurements, notes } = req.body;
  if (!measurements) return res.status(400).json({ message: 'measurements are required' });

  const d = new Date(date || Date.now());
  d.setUTCHours(0, 0, 0, 0);

  const existing = await BodyMeasurement.findOne({ userId: req.userId, date: d });
  if (existing) {
    Object.assign(existing.measurements, measurements);
    if (notes !== undefined) existing.notes = notes;
    await existing.save();
    return res.json({ measurement: existing });
  }

  const measurement = await BodyMeasurement.create({
    userId: req.userId,
    date: d,
    measurements,
    notes: notes || '',
  });
  res.status(201).json({ measurement });
}

module.exports = { getMeasurements, getLatest, addMeasurement };
