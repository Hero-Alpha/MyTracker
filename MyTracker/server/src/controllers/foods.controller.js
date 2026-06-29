const Food = require('../models/Food');

async function search(req, res) {
  try {
    const { q = '', type } = req.query;
    if (!q.trim()) return res.json({ foods: [] });

    const filter = { isActive: true, $or: [{ name: { $regex: q.trim(), $options: 'i' } }] };

    if (type === 'supplement') {
      filter.category = 'supplement';
    } else if (type === 'food') {
      filter.category = { $ne: 'supplement' };
    }

    filter.$and = [{ $or: [{ source: 'system' }, { source: 'user', userId: req.userId }] }];

    const foods = await Food.find(filter).limit(20).lean();
    res.json({ foods });
  } catch (err) {
    console.error('search error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function createFood(req, res) {
  try {
    const { name, servingSize, servingUnit, nutrition, commonUnits, category } = req.body || {};

    if (!name || !servingSize || !servingUnit || !nutrition) {
      return res.status(400).json({ message: 'name, servingSize, servingUnit and nutrition are required' });
    }

    const food = await Food.create({
      name,
      source: 'user',
      userId: req.userId,
      servingSize: Number(servingSize),
      servingUnit,
      nutrition,
      commonUnits: commonUnits || [],
      category: category || 'other',
    });

    res.status(201).json({ food });
  } catch (err) {
    console.error('createFood error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function getUserFoods(req, res) {
  try {
    const foods = await Food.find({ source: 'user', userId: req.userId, isActive: true }).lean();
    res.json({ foods });
  } catch (err) {
    console.error('getUserFoods error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { search, createFood, getUserFoods };
