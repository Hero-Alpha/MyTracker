require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Food = require('../models/Food');

const foods = [
  // ── GRAINS ──────────────────────────────────────────────────────────────
  { name: 'Wheat Roti',         category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 297, protein: 9.7,  carbs: 52.8, fat: 5.4,  sugar: 0.4, fiber: 2.7 }, commonUnits: [{ unit: '1 roti', grams: 40 }] },
  { name: 'Bajra Roti',         category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 361, protein: 11.6, carbs: 67.5, fat: 5.0,  sugar: 0,   fiber: 1.3 }, commonUnits: [{ unit: '1 roti', grams: 45 }] },
  { name: 'Jowar Roti',         category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 329, protein: 10.4, carbs: 72.6, fat: 1.9,  sugar: 0,   fiber: 2.0 }, commonUnits: [{ unit: '1 roti', grams: 45 }] },
  { name: 'White Rice (cooked)',category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 130, protein: 2.7,  carbs: 28.6, fat: 0.3,  sugar: 0,   fiber: 0.4 }, commonUnits: [{ unit: '1 katori', grams: 150 }, { unit: '1 cup', grams: 200 }] },
  { name: 'Brown Rice (cooked)',category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 123, protein: 2.6,  carbs: 25.6, fat: 0.9,  sugar: 0.4, fiber: 1.8 }, commonUnits: [{ unit: '1 katori', grams: 150 }, { unit: '1 cup', grams: 200 }] },
  { name: 'Basmati Rice (cooked)', category: 'grain', servingSize: 100, servingUnit: 'g', nutrition: { calories: 121, protein: 2.5,  carbs: 25.2, fat: 0.4,  sugar: 0,   fiber: 0.3 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Oats',               category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9,  sugar: 0,   fiber: 10.6 }, commonUnits: [{ unit: '1 cup dry', grams: 90 }, { unit: '1 tbsp', grams: 10 }] },
  { name: 'Poha (cooked)',      category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 130, protein: 2.8,  carbs: 26.6, fat: 2.0,  sugar: 0.5, fiber: 1.0 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Upma (cooked)',      category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 120, protein: 3.0,  carbs: 22.0, fat: 2.5,  sugar: 0.5, fiber: 1.2 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'White Bread',        category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 265, protein: 9.0,  carbs: 49.0, fat: 3.2,  sugar: 5.0, fiber: 2.7 }, commonUnits: [{ unit: '1 slice', grams: 25 }] },
  { name: 'Brown Bread',        category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 247, protein: 9.5,  carbs: 43.0, fat: 3.5,  sugar: 4.0, fiber: 5.0 }, commonUnits: [{ unit: '1 slice', grams: 25 }] },
  { name: 'Idli',               category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 58,  protein: 2.0,  carbs: 12.0, fat: 0.4,  sugar: 0,   fiber: 0.5 }, commonUnits: [{ unit: '1 idli', grams: 40 }] },
  { name: 'Dosa (plain)',       category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 133, protein: 4.5,  carbs: 24.5, fat: 2.0,  sugar: 0.5, fiber: 0.8 }, commonUnits: [{ unit: '1 dosa', grams: 80 }] },
  { name: 'Paratha (plain)',    category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 326, protein: 8.3,  carbs: 48.0, fat: 11.5, sugar: 1.0, fiber: 2.3 }, commonUnits: [{ unit: '1 paratha', grams: 70 }] },
  { name: 'Puri',               category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 340, protein: 7.0,  carbs: 45.0, fat: 14.5, sugar: 0.5, fiber: 2.0 }, commonUnits: [{ unit: '1 puri', grams: 30 }] },

  // ── LEGUMES / DAL ────────────────────────────────────────────────────────
  { name: 'Toor Dal (cooked)',  category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 116, protein: 7.2,  carbs: 20.6, fat: 0.4,  sugar: 0,   fiber: 5.0 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Moong Dal (cooked)', category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 105, protein: 7.0,  carbs: 18.4, fat: 0.4,  sugar: 1.3, fiber: 4.1 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Urad Dal (cooked)',  category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 118, protein: 7.6,  carbs: 21.0, fat: 0.5,  sugar: 0,   fiber: 6.0 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Chana Dal (cooked)', category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 125, protein: 8.2,  carbs: 22.3, fat: 0.6,  sugar: 2.0, fiber: 5.8 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Masoor Dal (cooked)',category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 116, protein: 9.0,  carbs: 20.1, fat: 0.4,  sugar: 1.8, fiber: 7.9 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Rajma (cooked)',     category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 127, protein: 8.7,  carbs: 22.8, fat: 0.5,  sugar: 0.3, fiber: 7.4 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Chole (cooked)',     category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 164, protein: 8.9,  carbs: 27.4, fat: 2.6,  sugar: 4.8, fiber: 7.6 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Whole Moong (cooked)', category: 'protein', servingSize: 100, servingUnit: 'g', nutrition: { calories: 105, protein: 7.0,  carbs: 19.1, fat: 0.4,  sugar: 2.0, fiber: 6.0 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },

  // ── ANIMAL PROTEINS ──────────────────────────────────────────────────────
  { name: 'Egg (whole)',        category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 155, protein: 13.0, carbs: 1.1,  fat: 11.0, sugar: 1.1, fiber: 0 }, commonUnits: [{ unit: '1 egg', grams: 50 }] },
  { name: 'Egg White',          category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 52,  protein: 10.9, carbs: 0.7,  fat: 0.2,  sugar: 0.7, fiber: 0 }, commonUnits: [{ unit: '1 white', grams: 33 }] },
  { name: 'Egg Yolk',           category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 322, protein: 15.9, carbs: 3.6,  fat: 26.5, sugar: 0.6, fiber: 0 }, commonUnits: [{ unit: '1 yolk', grams: 17 }] },
  { name: 'Chicken Breast (cooked)', category: 'protein', servingSize: 100, servingUnit: 'g', nutrition: { calories: 165, protein: 31.0, carbs: 0,    fat: 3.6,  sugar: 0,   fiber: 0 }, commonUnits: [{ unit: '1 piece', grams: 120 }] },
  { name: 'Chicken Leg (cooked)',    category: 'protein', servingSize: 100, servingUnit: 'g', nutrition: { calories: 191, protein: 26.9, carbs: 0,    fat: 9.0,  sugar: 0,   fiber: 0 }, commonUnits: [{ unit: '1 leg', grams: 100 }] },
  { name: 'Mutton (cooked)',    category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 294, protein: 25.6, carbs: 0,    fat: 21.0, sugar: 0,   fiber: 0 }, commonUnits: [{ unit: '1 piece', grams: 80 }] },
  { name: 'Fish (Rohu, cooked)',category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 149, protein: 20.0, carbs: 0,    fat: 7.0,  sugar: 0,   fiber: 0 }, commonUnits: [{ unit: '1 piece', grams: 100 }] },
  { name: 'Tuna (canned)',      category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 116, protein: 25.5, carbs: 0,    fat: 0.8,  sugar: 0,   fiber: 0 }, commonUnits: [{ unit: '1 can', grams: 140 }] },

  // ── DAIRY ────────────────────────────────────────────────────────────────
  { name: 'Milk (full fat)',    category: 'dairy',     servingSize: 100, servingUnit: 'ml', nutrition: { calories: 61,  protein: 3.2,  carbs: 4.7,  fat: 3.3,  sugar: 4.7, fiber: 0 }, commonUnits: [{ unit: '1 glass', grams: 250 }, { unit: '1 cup', grams: 200 }] },
  { name: 'Milk (toned)',       category: 'dairy',     servingSize: 100, servingUnit: 'ml', nutrition: { calories: 44,  protein: 3.4,  carbs: 5.1,  fat: 1.5,  sugar: 5.1, fiber: 0 }, commonUnits: [{ unit: '1 glass', grams: 250 }, { unit: '1 cup', grams: 200 }] },
  { name: 'Curd (full fat)',    category: 'dairy',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 61,  protein: 3.4,  carbs: 4.9,  fat: 3.3,  sugar: 4.9, fiber: 0 }, commonUnits: [{ unit: '1 katori', grams: 150 }, { unit: '1 cup', grams: 200 }] },
  { name: 'Curd (low fat)',     category: 'dairy',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 43,  protein: 3.6,  carbs: 5.6,  fat: 0.9,  sugar: 5.6, fiber: 0 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Paneer',             category: 'dairy',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 265, protein: 18.3, carbs: 1.2,  fat: 20.8, sugar: 1.2, fiber: 0 }, commonUnits: [{ unit: '1 cube', grams: 30 }, { unit: '1 katori cubed', grams: 100 }] },
  { name: 'Ghee',               category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 900, protein: 0,    carbs: 0,    fat: 99.7, sugar: 0,   fiber: 0 }, commonUnits: [{ unit: '1 tsp', grams: 5 }, { unit: '1 tbsp', grams: 14 }] },
  { name: 'Butter',             category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 717, protein: 0.9,  carbs: 0.1,  fat: 81.0, sugar: 0.1, fiber: 0 }, commonUnits: [{ unit: '1 tsp', grams: 5 }, { unit: '1 tbsp', grams: 14 }] },
  { name: 'Cheese (processed)', category: 'dairy',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 321, protein: 22.0, carbs: 1.5,  fat: 25.0, sugar: 1.0, fiber: 0 }, commonUnits: [{ unit: '1 slice', grams: 20 }] },
  { name: 'Whey Protein (powder)', category: 'protein',servingSize: 100, servingUnit: 'g', nutrition: { calories: 373, protein: 80.0, carbs: 7.0,  fat: 3.5,  sugar: 5.0, fiber: 0 }, commonUnits: [{ unit: '1 scoop', grams: 30 }] },

  // ── VEGETABLES ───────────────────────────────────────────────────────────
  { name: 'Spinach (palak)',    category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 23,  protein: 2.9,  carbs: 3.6,  fat: 0.4,  sugar: 0.4, fiber: 2.2 }, commonUnits: [{ unit: '1 cup', grams: 30 }] },
  { name: 'Potato (boiled)',    category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 86,  protein: 1.9,  carbs: 20.1, fat: 0.1,  sugar: 0.9, fiber: 1.8 }, commonUnits: [{ unit: '1 medium', grams: 150 }, { unit: '1 small', grams: 100 }] },
  { name: 'Sweet Potato',       category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 86,  protein: 1.6,  carbs: 20.0, fat: 0.1,  sugar: 4.2, fiber: 3.0 }, commonUnits: [{ unit: '1 medium', grams: 130 }] },
  { name: 'Tomato',             category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 18,  protein: 0.9,  carbs: 3.9,  fat: 0.2,  sugar: 2.6, fiber: 1.2 }, commonUnits: [{ unit: '1 medium', grams: 120 }] },
  { name: 'Onion',              category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 40,  protein: 1.1,  carbs: 9.3,  fat: 0.1,  sugar: 4.2, fiber: 1.7 }, commonUnits: [{ unit: '1 medium', grams: 100 }] },
  { name: 'Cauliflower',        category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 25,  protein: 1.9,  carbs: 5.0,  fat: 0.3,  sugar: 1.9, fiber: 2.0 }, commonUnits: [{ unit: '1 cup', grams: 100 }] },
  { name: 'Broccoli',          category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 34,  protein: 2.8,  carbs: 7.0,  fat: 0.4,  sugar: 1.7, fiber: 2.6 }, commonUnits: [{ unit: '1 cup', grams: 90 }] },
  { name: 'Carrot',             category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 41,  protein: 0.9,  carbs: 9.6,  fat: 0.2,  sugar: 4.7, fiber: 2.8 }, commonUnits: [{ unit: '1 medium', grams: 80 }] },
  { name: 'Cucumber',           category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 15,  protein: 0.7,  carbs: 3.6,  fat: 0.1,  sugar: 1.7, fiber: 0.5 }, commonUnits: [{ unit: '1 cup sliced', grams: 120 }] },
  { name: 'Capsicum (green)',   category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 20,  protein: 0.9,  carbs: 4.6,  fat: 0.2,  sugar: 2.4, fiber: 1.7 }, commonUnits: [{ unit: '1 medium', grams: 120 }] },
  { name: 'Bhindi (okra)',      category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 33,  protein: 1.9,  carbs: 7.5,  fat: 0.2,  sugar: 1.5, fiber: 3.2 }, commonUnits: [{ unit: '1 cup', grams: 100 }] },
  { name: 'Peas (green)',       category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 81,  protein: 5.4,  carbs: 14.5, fat: 0.4,  sugar: 5.7, fiber: 5.1 }, commonUnits: [{ unit: '1 katori', grams: 100 }] },
  { name: 'Mushroom',           category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 22,  protein: 3.1,  carbs: 3.3,  fat: 0.3,  sugar: 2.0, fiber: 1.0 }, commonUnits: [{ unit: '1 cup', grams: 70 }] },
  { name: 'Beetroot',           category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 43,  protein: 1.6,  carbs: 9.6,  fat: 0.2,  sugar: 6.8, fiber: 2.8 }, commonUnits: [{ unit: '1 medium', grams: 100 }] },

  // ── FRUITS ───────────────────────────────────────────────────────────────
  { name: 'Banana',             category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 89,  protein: 1.1,  carbs: 23.0, fat: 0.3,  sugar: 12.2, fiber: 2.6 }, commonUnits: [{ unit: '1 medium', grams: 100 }, { unit: '1 large', grams: 130 }] },
  { name: 'Apple',              category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 52,  protein: 0.3,  carbs: 14.0, fat: 0.2,  sugar: 10.4, fiber: 2.4 }, commonUnits: [{ unit: '1 medium', grams: 150 }] },
  { name: 'Mango',              category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 60,  protein: 0.8,  carbs: 15.0, fat: 0.4,  sugar: 13.7, fiber: 1.6 }, commonUnits: [{ unit: '1 cup', grams: 165 }, { unit: '1 slice', grams: 40 }] },
  { name: 'Orange',             category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 47,  protein: 0.9,  carbs: 12.0, fat: 0.1,  sugar: 9.4,  fiber: 2.4 }, commonUnits: [{ unit: '1 medium', grams: 130 }] },
  { name: 'Papaya',             category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 43,  protein: 0.5,  carbs: 11.0, fat: 0.3,  sugar: 7.8,  fiber: 1.7 }, commonUnits: [{ unit: '1 cup', grams: 145 }] },
  { name: 'Guava',              category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 68,  protein: 2.6,  carbs: 14.3, fat: 1.0,  sugar: 8.9,  fiber: 5.4 }, commonUnits: [{ unit: '1 medium', grams: 100 }] },
  { name: 'Watermelon',         category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 30,  protein: 0.6,  carbs: 7.6,  fat: 0.2,  sugar: 6.2,  fiber: 0.4 }, commonUnits: [{ unit: '1 slice', grams: 200 }] },
  { name: 'Grapes',             category: 'fruit',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 69,  protein: 0.7,  carbs: 18.1, fat: 0.2,  sugar: 15.5, fiber: 0.9 }, commonUnits: [{ unit: '1 cup', grams: 150 }] },

  // ── NUTS & SEEDS ─────────────────────────────────────────────────────────
  { name: 'Almonds',            category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, sugar: 4.4,  fiber: 12.5 }, commonUnits: [{ unit: '10 almonds', grams: 12 }] },
  { name: 'Cashews',            category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, sugar: 5.9,  fiber: 3.3 }, commonUnits: [{ unit: '10 cashews', grams: 15 }] },
  { name: 'Walnuts',            category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, sugar: 2.6,  fiber: 6.7 }, commonUnits: [{ unit: '4 halves', grams: 15 }] },
  { name: 'Peanuts',            category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, sugar: 4.7,  fiber: 8.5 }, commonUnits: [{ unit: '1 handful', grams: 25 }] },
  { name: 'Peanut Butter',      category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 588, protein: 25.1, carbs: 20.0, fat: 50.4, sugar: 9.0,  fiber: 6.0 }, commonUnits: [{ unit: '1 tsp', grams: 8 }, { unit: '1 tbsp', grams: 16 }] },
  { name: 'Flaxseeds',          category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, sugar: 1.6,  fiber: 27.3 }, commonUnits: [{ unit: '1 tbsp', grams: 10 }] },
  { name: 'Chia Seeds',         category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, sugar: 0,    fiber: 34.4 }, commonUnits: [{ unit: '1 tbsp', grams: 12 }] },
  { name: 'Sunflower Seeds',    category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 584, protein: 20.8, carbs: 20.0, fat: 51.5, sugar: 2.6,  fiber: 8.6 }, commonUnits: [{ unit: '1 tbsp', grams: 12 }] },

  // ── FATS & OILS ──────────────────────────────────────────────────────────
  { name: 'Coconut Oil',        category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 892, protein: 0,    carbs: 0,    fat: 99.1, sugar: 0,    fiber: 0 }, commonUnits: [{ unit: '1 tsp', grams: 5 }, { unit: '1 tbsp', grams: 14 }] },
  { name: 'Mustard Oil',        category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 884, protein: 0,    carbs: 0,    fat: 100,  sugar: 0,    fiber: 0 }, commonUnits: [{ unit: '1 tsp', grams: 5 }, { unit: '1 tbsp', grams: 14 }] },
  { name: 'Olive Oil',          category: 'fat',       servingSize: 100, servingUnit: 'g', nutrition: { calories: 884, protein: 0,    carbs: 0,    fat: 100,  sugar: 0,    fiber: 0 }, commonUnits: [{ unit: '1 tsp', grams: 5 }, { unit: '1 tbsp', grams: 14 }] },

  // ── BEVERAGES ────────────────────────────────────────────────────────────
  { name: 'Coconut Water',      category: 'beverage',  servingSize: 100, servingUnit: 'ml', nutrition: { calories: 19,  protein: 0.7,  carbs: 3.7,  fat: 0.2,  sugar: 2.6, fiber: 1.1 }, commonUnits: [{ unit: '1 glass', grams: 250 }] },
  { name: 'Green Tea',          category: 'beverage',  servingSize: 100, servingUnit: 'ml', nutrition: { calories: 1,   protein: 0.2,  carbs: 0.2,  fat: 0,    sugar: 0,   fiber: 0 },   commonUnits: [{ unit: '1 cup', grams: 240 }] },
  { name: 'Black Coffee',       category: 'beverage',  servingSize: 100, servingUnit: 'ml', nutrition: { calories: 2,   protein: 0.3,  carbs: 0,    fat: 0,    sugar: 0,   fiber: 0 },   commonUnits: [{ unit: '1 cup', grams: 240 }] },
  { name: 'Chai (with milk)',   category: 'beverage',  servingSize: 100, servingUnit: 'ml', nutrition: { calories: 38,  protein: 1.3,  carbs: 6.5,  fat: 1.0,  sugar: 4.5, fiber: 0 },   commonUnits: [{ unit: '1 cup', grams: 150 }] },
  { name: 'Orange Juice',       category: 'beverage',  servingSize: 100, servingUnit: 'ml', nutrition: { calories: 45,  protein: 0.7,  carbs: 10.4, fat: 0.2,  sugar: 8.4, fiber: 0.2 }, commonUnits: [{ unit: '1 glass', grams: 250 }] },

  // ── SNACKS ───────────────────────────────────────────────────────────────
  { name: 'Popcorn (plain)',    category: 'snack',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 387, protein: 12.9, carbs: 77.9, fat: 4.5,  sugar: 0.9,  fiber: 14.5 }, commonUnits: [{ unit: '1 cup', grams: 8 }] },
  { name: 'Murmura (puffed rice)', category: 'snack', servingSize: 100, servingUnit: 'g', nutrition: { calories: 402, protein: 7.0,  carbs: 90.0, fat: 0.5,  sugar: 0.3,  fiber: 0.5 }, commonUnits: [{ unit: '1 cup', grams: 15 }] },
  { name: 'Roasted Chana',      category: 'snack',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 364, protein: 22.5, carbs: 57.4, fat: 5.0,  sugar: 5.7,  fiber: 16.5 }, commonUnits: [{ unit: '1 handful', grams: 30 }] },

  // ── SAUCES / CONDIMENTS ──────────────────────────────────────────────────
  { name: 'Honey',              category: 'other',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 304, protein: 0.3,  carbs: 82.4, fat: 0,    sugar: 82.1, fiber: 0.2 }, commonUnits: [{ unit: '1 tsp', grams: 7 }, { unit: '1 tbsp', grams: 21 }] },
  { name: 'Sugar (white)',      category: 'other',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 387, protein: 0,    carbs: 99.9, fat: 0,    sugar: 99.9, fiber: 0 },   commonUnits: [{ unit: '1 tsp', grams: 4 }, { unit: '1 tbsp', grams: 12 }] },
  { name: 'Jaggery (gur)',      category: 'other',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 383, protein: 0.4,  carbs: 98.0, fat: 0.1,  sugar: 97.0, fiber: 0 },   commonUnits: [{ unit: '1 piece', grams: 10 }] },
  { name: 'Tomato Ketchup',     category: 'other',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 101, protein: 1.7,  carbs: 25.5, fat: 0.2,  sugar: 21.0, fiber: 0.5 }, commonUnits: [{ unit: '1 tbsp', grams: 15 }] },
];

// New foods added in later updates — upserted on server startup
const newFoods = [
  // ── FRIED / COOKED VARIANTS ──────────────────────────────────────────────
  { name: 'Fried Egg',            category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 196, protein: 13.6, carbs: 0.4,  fat: 14.8, sugar: 0.4, fiber: 0 },   commonUnits: [{ unit: '1 egg', grams: 46 }] },
  { name: 'Scrambled Egg',        category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 149, protein: 10.1, carbs: 1.6,  fat: 11.4, sugar: 1.4, fiber: 0 },   commonUnits: [{ unit: '1 egg', grams: 65 }] },
  { name: 'Boiled Egg',           category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 155, protein: 12.6, carbs: 1.1,  fat: 10.6, sugar: 1.1, fiber: 0 },   commonUnits: [{ unit: '1 egg', grams: 50 }] },
  { name: 'Aloo Fry (fried potato)', category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 142, protein: 2.0,  carbs: 20.0, fat: 6.0,  sugar: 1.0, fiber: 1.8 }, commonUnits: [{ unit: '1 katori', grams: 100 }] },
  { name: 'French Fries',         category: 'snack',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 312, protein: 3.4,  carbs: 41.4, fat: 14.7, sugar: 0.5, fiber: 3.8 }, commonUnits: [{ unit: '1 medium portion', grams: 120 }, { unit: '1 small portion', grams: 80 }] },
  { name: 'Aloo Sabzi',           category: 'vegetable', servingSize: 100, servingUnit: 'g', nutrition: { calories: 115, protein: 1.8,  carbs: 17.0, fat: 4.5,  sugar: 1.0, fiber: 1.5 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Paneer Bhurji',        category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 210, protein: 12.0, carbs: 4.0,  fat: 16.0, sugar: 2.0, fiber: 0.5 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
  { name: 'Butter Chicken',       category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 150, protein: 14.0, carbs: 6.0,  fat: 8.0,  sugar: 3.0, fiber: 0.5 }, commonUnits: [{ unit: '1 katori', grams: 200 }] },
  { name: 'Palak Paneer',         category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 112, protein: 7.0,  carbs: 5.5,  fat: 7.5,  sugar: 1.5, fiber: 1.5 }, commonUnits: [{ unit: '1 katori', grams: 200 }] },
  { name: 'Dal Makhani',          category: 'protein',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 124, protein: 6.5,  carbs: 15.0, fat: 4.5,  sugar: 1.5, fiber: 4.0 }, commonUnits: [{ unit: '1 katori', grams: 200 }] },
  { name: 'Chicken Biryani',      category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 190, protein: 10.0, carbs: 25.0, fat: 5.0,  sugar: 1.0, fiber: 0.8 }, commonUnits: [{ unit: '1 plate', grams: 350 }] },
  { name: 'Veg Biryani',          category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 155, protein: 4.0,  carbs: 28.0, fat: 3.5,  sugar: 2.0, fiber: 2.0 }, commonUnits: [{ unit: '1 plate', grams: 300 }] },
  { name: 'Naan',                 category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 310, protein: 9.0,  carbs: 55.0, fat: 6.0,  sugar: 2.5, fiber: 2.0 }, commonUnits: [{ unit: '1 naan', grams: 90 }] },
  { name: 'Pav Bhaji',            category: 'other',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 152, protein: 3.8,  carbs: 24.0, fat: 5.0,  sugar: 3.0, fiber: 2.5 }, commonUnits: [{ unit: '1 serving (bhaji)', grams: 200 }] },
  { name: 'Samosa',               category: 'snack',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 308, protein: 5.2,  carbs: 36.0, fat: 16.0, sugar: 1.5, fiber: 2.0 }, commonUnits: [{ unit: '1 samosa', grams: 60 }] },
  { name: 'Vada Pav',             category: 'snack',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 298, protein: 6.0,  carbs: 40.0, fat: 12.5, sugar: 2.0, fiber: 2.0 }, commonUnits: [{ unit: '1 piece', grams: 120 }] },

  // ── CEREALS & BREAKFAST ──────────────────────────────────────────────────
  { name: "Kellogg's Muesli",     category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 354, protein: 8.0,  carbs: 68.0, fat: 6.0,  sugar: 18.0, fiber: 5.0 }, commonUnits: [{ unit: '1 bowl (45g)', grams: 45 }] },
  { name: "Kellogg's Corn Flakes",category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 357, protein: 7.5,  carbs: 84.0, fat: 0.9,  sugar: 7.5,  fiber: 1.2 }, commonUnits: [{ unit: '1 bowl (30g)', grams: 30 }] },
  { name: "Kellogg's Chocos",     category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 389, protein: 6.5,  carbs: 82.0, fat: 4.5,  sugar: 35.0, fiber: 3.0 }, commonUnits: [{ unit: '1 bowl (30g)', grams: 30 }] },
  { name: 'Granola',              category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 471, protein: 10.0, carbs: 64.0, fat: 20.0, sugar: 24.0, fiber: 5.0 }, commonUnits: [{ unit: '1 cup', grams: 90 }] },
  { name: 'Cornflakes (generic)', category: 'grain',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 357, protein: 7.0,  carbs: 84.0, fat: 1.0,  sugar: 8.0,  fiber: 1.0 }, commonUnits: [{ unit: '1 bowl (30g)', grams: 30 }] },

  // ── FAST FOOD / PACKAGED ─────────────────────────────────────────────────
  { name: 'Maggi Noodles (cooked)', category: 'grain',   servingSize: 100, servingUnit: 'g', nutrition: { calories: 156, protein: 4.0,  carbs: 22.0, fat: 5.5,  sugar: 0.5, fiber: 0.5 }, commonUnits: [{ unit: '1 packet cooked', grams: 200 }] },
  { name: 'Pizza (cheese, 1 slice)', category: 'snack',  servingSize: 100, servingUnit: 'g', nutrition: { calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0, sugar: 3.5, fiber: 2.0 }, commonUnits: [{ unit: '1 slice', grams: 100 }] },
  { name: 'Burger (chicken)',      category: 'snack',    servingSize: 100, servingUnit: 'g', nutrition: { calories: 245, protein: 12.0, carbs: 30.0, fat: 9.0,  sugar: 5.0, fiber: 1.5 }, commonUnits: [{ unit: '1 burger', grams: 150 }] },
  { name: 'Sandwich (veg)',        category: 'snack',    servingSize: 100, servingUnit: 'g', nutrition: { calories: 185, protein: 5.5,  carbs: 28.0, fat: 6.0,  sugar: 3.0, fiber: 2.0 }, commonUnits: [{ unit: '1 sandwich', grams: 150 }] },
  { name: 'Coke / Pepsi',         category: 'beverage', servingSize: 100, servingUnit: 'ml', nutrition: { calories: 41,  protein: 0,    carbs: 10.6, fat: 0,    sugar: 10.6, fiber: 0 },  commonUnits: [{ unit: '1 can (330ml)', grams: 330 }, { unit: '1 glass', grams: 250 }] },

  // ── DAIRY EXTRAS ─────────────────────────────────────────────────────────
  { name: 'Greek Yogurt',         category: 'dairy',     servingSize: 100, servingUnit: 'g', nutrition: { calories: 59,  protein: 10.0, carbs: 3.6,  fat: 0.4,  sugar: 3.2, fiber: 0 },   commonUnits: [{ unit: '1 cup', grams: 200 }] },
  { name: 'Ice Cream (vanilla)',   category: 'snack',    servingSize: 100, servingUnit: 'g', nutrition: { calories: 207, protein: 3.5,  carbs: 24.0, fat: 11.0, sugar: 21.0, fiber: 0.6 }, commonUnits: [{ unit: '1 scoop', grams: 65 }, { unit: '1 cup', grams: 130 }] },

  // ── SNACKS ───────────────────────────────────────────────────────────────
  { name: 'Biscuits (Marie)',      category: 'snack',    servingSize: 100, servingUnit: 'g', nutrition: { calories: 410, protein: 7.0,  carbs: 75.0, fat: 9.5,  sugar: 18.0, fiber: 1.5 }, commonUnits: [{ unit: '1 biscuit', grams: 6 }, { unit: '4 biscuits', grams: 25 }] },
  { name: 'Dark Chocolate',        category: 'snack',    servingSize: 100, servingUnit: 'g', nutrition: { calories: 546, protein: 4.9,  carbs: 59.4, fat: 31.3, sugar: 47.9, fiber: 7.0 }, commonUnits: [{ unit: '1 square', grams: 10 }, { unit: '1 bar', grams: 40 }] },
  { name: 'Sprouts (mixed, cooked)', category: 'protein', servingSize: 100, servingUnit: 'g', nutrition: { calories: 62, protein: 4.3,  carbs: 11.5, fat: 0.4,  sugar: 2.0, fiber: 1.8 },  commonUnits: [{ unit: '1 katori', grams: 100 }] },
  { name: 'Namkeen / Mixture',     category: 'snack',    servingSize: 100, servingUnit: 'g', nutrition: { calories: 450, protein: 9.0,  carbs: 55.0, fat: 22.0, sugar: 3.0, fiber: 3.0 }, commonUnits: [{ unit: '1 handful', grams: 30 }] },
  { name: 'Upma with Vegetables',  category: 'grain',    servingSize: 100, servingUnit: 'g', nutrition: { calories: 112, protein: 2.8,  carbs: 18.0, fat: 3.5,  sugar: 1.0, fiber: 1.5 }, commonUnits: [{ unit: '1 katori', grams: 150 }] },
];

// Upserts newFoods — called on server startup, safe to run repeatedly
async function upsertNewFoods() {
  try {
    if (!newFoods.length) return;
    const ops = newFoods.map(f => ({
      updateOne: {
        filter: { name: f.name, source: 'system' },
        update: { $set: { ...f, source: 'system', userId: null } },
        upsert: true,
      },
    }));
    const result = await Food.bulkWrite(ops, { ordered: false });
    if (result.upsertedCount > 0) {
      console.log(`Food library: added ${result.upsertedCount} new items`);
    }
  } catch (err) {
    console.error('upsertNewFoods error:', err.message);
  }
}

module.exports = { upsertNewFoods };

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingCount = await Food.countDocuments({ source: 'system' });
    if (existingCount > 0) {
      console.log(`${existingCount} system foods already exist — skipping seed`);
      process.exit(0);
    }

    const docs = foods.map(f => ({ ...f, source: 'system', userId: null }));
    await Food.insertMany(docs);
    console.log(`Seeded ${docs.length} foods`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

// Only auto-run when executed directly (node foods.seed.js), not when imported
if (require.main === module) {
  seed();
}
