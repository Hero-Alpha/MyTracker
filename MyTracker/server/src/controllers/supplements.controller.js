const Food = require('../models/Food');
const { parseSupplementLabel } = require('../services/gemini.service');

async function parseLabel(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    const mimeType = req.file.mimetype;
    const parsed = await parseSupplementLabel(req.file.buffer, mimeType);
    res.json({ parsed });
  } catch (err) {
    console.error('Gemini parse error:', err?.message, err?.status, JSON.stringify(err?.errorDetails));
    res.status(502).json({ message: 'Failed to parse label.', detail: err?.message });
  }
}

async function saveSupplement(req, res) {
  const { name, servingSize, servingUnit, nutrition, commonUnits } = req.body;

  if (!name || !servingSize || !servingUnit || !nutrition) {
    return res.status(400).json({ message: 'name, servingSize, servingUnit and nutrition are required' });
  }

  try {
    const existing = await Food.findOne({ name, source: 'user', userId: req.userId, category: 'supplement' });
    if (existing) {
      Object.assign(existing, { servingSize, servingUnit, nutrition, commonUnits: commonUnits || [] });
      await existing.save();
      return res.json({ food: existing });
    }

    const food = await Food.create({
      name,
      source: 'user',
      userId: req.userId,
      servingSize: Number(servingSize),
      servingUnit,
      nutrition,
      commonUnits: commonUnits || [],
      category: 'supplement',
    });

    res.status(201).json({ food });
  } catch (err) {
    console.error('saveSupplement error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function getUserSupplements(req, res) {
  try {
    const supplements = await Food.find({ source: 'user', userId: req.userId, category: 'supplement', isActive: true }).lean();
    res.json({ supplements });
  } catch (err) {
    console.error('getUserSupplements error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function updateSupplement(req, res) {
  const { name, servingSize, servingUnit, nutrition, commonUnits } = req.body;
  try {
    const supp = await Food.findOne({ _id: req.params.id, userId: req.userId, source: 'user', category: 'supplement' });
    if (!supp) return res.status(404).json({ message: 'Not found' });
    Object.assign(supp, { name, servingSize: Number(servingSize), servingUnit, nutrition, commonUnits: commonUnits || [] });
    await supp.save();
    res.json({ food: supp });
  } catch (err) {
    console.error('updateSupplement error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function deleteSupplement(req, res) {
  try {
    const supp = await Food.findOne({ _id: req.params.id, userId: req.userId, source: 'user', category: 'supplement' });
    if (!supp) return res.status(404).json({ message: 'Not found' });
    supp.isActive = false;
    await supp.save();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteSupplement error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { parseLabel, saveSupplement, getUserSupplements, updateSupplement, deleteSupplement };
