const ACTIVITY_MULTIPLIERS = {
  sedentary:  1.2,
  light:      1.375,
  moderate:   1.55,
  active:     1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS = {
  lose_weight:  -500,
  maintain:     0,
  gain_muscle:  300,
};

function calculateBMR(weight, heightCm, age, gender) {
  const base = 10 * weight + 6.25 * heightCm - 5 * age;
  return gender === 'female' ? base - 161 : base + 5;
}

function calculateDailyTargets(profile) {
  const { weight, heightCm, age, gender, activityLevel, goal } = profile;

  const bmr  = calculateBMR(weight, heightCm, age, gender);
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55);
  const calories = Math.round(tdee + (GOAL_ADJUSTMENTS[goal] || 0));

  const protein = Math.round(weight * 2);
  const fat     = Math.round((calories * 0.25) / 9);
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat, water: 2500 };
}

function computeMealTotals(items) {
  return items.reduce((acc, item) => {
    acc.calories += item.nutrition.calories || 0;
    acc.protein  += item.nutrition.protein  || 0;
    acc.carbs    += item.nutrition.carbs    || 0;
    acc.fat      += item.nutrition.fat      || 0;
    acc.sugar    += item.nutrition.sugar    || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });
}

function computeDayTotals(meals) {
  const all = [
    ...meals.breakfast,
    ...meals.lunch,
    ...meals.dinner,
    ...meals.snacks,
  ];
  return computeMealTotals(all);
}

function computeItemNutrition(food, quantity, unit) {
  let grams = quantity;

  if (unit !== food.servingUnit) {
    const match = food.commonUnits.find(u => u.unit === unit);
    if (match) grams = match.grams * quantity;
  }

  const ratio = grams / food.servingSize;

  return {
    calories: Math.round(food.nutrition.calories * ratio * 10) / 10,
    protein:  Math.round(food.nutrition.protein  * ratio * 10) / 10,
    carbs:    Math.round(food.nutrition.carbs    * ratio * 10) / 10,
    fat:      Math.round(food.nutrition.fat      * ratio * 10) / 10,
    sugar:    Math.round(food.nutrition.sugar    * ratio * 10) / 10,
  };
}

module.exports = { calculateDailyTargets, computeDayTotals, computeItemNutrition };
