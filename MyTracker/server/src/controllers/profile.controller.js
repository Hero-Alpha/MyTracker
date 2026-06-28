const User = require('../models/User');
const { calculateDailyTargets } = require('../services/nutrition.service');

async function getProfile(req, res) {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
}

async function updateProfile(req, res) {
  const { name, age, gender, height, currentWeight, targetWeight, activityLevel, goal } = req.body;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name)          user.name          = name;
  if (age)           user.age           = age;
  if (gender)        user.gender        = gender;
  if (height)        user.height        = height;
  if (currentWeight) user.currentWeight = currentWeight;
  if (targetWeight)  user.targetWeight  = targetWeight;
  if (activityLevel) user.activityLevel = activityLevel;
  if (goal)          user.goal          = goal;

  const hasRequiredFields =
    user.age && user.gender && user.height?.value &&
    user.currentWeight && user.activityLevel && user.goal;

  if (hasRequiredFields) {
    const heightCm = user.height.unit === 'ft'
      ? user.height.value * 30.48
      : user.height.value;

    user.dailyTargets = calculateDailyTargets({
      weight:        user.currentWeight,
      heightCm,
      age:           user.age,
      gender:        user.gender,
      activityLevel: user.activityLevel,
      goal:          user.goal,
    });

    user.profileComplete = true;
  }

  await user.save();
  const updated = user.toObject();
  delete updated.password;
  res.json({ user: updated });
}

module.exports = { getProfile, updateProfile };
