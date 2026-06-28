const WorkoutTemplate = require('../models/WorkoutTemplate');

async function getTemplates(req, res) {
  const templates = await WorkoutTemplate.find({ userId: req.userId, isActive: true }).lean();
  res.json({ templates });
}

async function createTemplate(req, res) {
  const { name, exercises } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });

  const template = await WorkoutTemplate.create({
    userId: req.userId,
    name,
    exercises: exercises || [],
  });
  res.status(201).json({ template });
}

async function updateTemplate(req, res) {
  const { name, exercises } = req.body;
  const template = await WorkoutTemplate.findOne({ _id: req.params.id, userId: req.userId });
  if (!template) return res.status(404).json({ message: 'Template not found' });

  if (name)      template.name      = name;
  if (exercises) template.exercises = exercises;
  await template.save();
  res.json({ template });
}

async function deleteTemplate(req, res) {
  const template = await WorkoutTemplate.findOne({ _id: req.params.id, userId: req.userId });
  if (!template) return res.status(404).json({ message: 'Template not found' });
  template.isActive = false;
  await template.save();
  res.json({ message: 'Deleted' });
}

module.exports = { getTemplates, createTemplate, updateTemplate, deleteTemplate };
