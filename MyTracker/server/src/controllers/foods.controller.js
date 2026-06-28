const Food = require('../models/Food');

async function search(req, res) {
  const { q = '', type } = req.query;
  if (!q.trim()) return res.json({ foods: [] });

  const filter = {
    isActive: true,
    $or: [
      { name: { $regex: q.trim(), $options: 'i' } },
    ],
  };

  if (type === 'supplement') {
    filter.category = 'supplement';
  } else if (type === 'food') {
    filter.category = { $ne: 'supplement' };
  }

  // System foods + user's own custom foods
  filter.$and = [
    {
      $or: [
        { source: 'system' },
        { source: 'user', userId: req.userId },
      ],
    },
  ];

  const foods = await Food.find(filter).limit(20).lean();
  res.json({ foods });
}

async function createFood(req, res) {
  const { name, servingSize, servingUnit, nutrition, commonUnits, category } = req.body;

  if (!name || !servingSize || !servingUnit || !nutrition) {
    return res.status(400).json({ message: 'name, servingSize, servingUnit and nutrition are required' });
  }

  const food = await Food.create({
    name,
    source: 'user',
    userId: req.userId,
    servingSize,
    servingUnit,
    nutrition,
    commonUnits: commonUnits || [],
    category: category || 'other',
  });

  res.status(201).json({ food });
}

async function getUserFoods(req, res) {
  const foods = await Food.find({ source: 'user', userId: req.userId, isActive: true }).lean();
  res.json({ foods });
}

module.exports = { search, createFood, getUserFoods };
