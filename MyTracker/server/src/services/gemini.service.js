const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PARSE_PROMPT = `You are analyzing a supplement nutrition label image.
Extract the nutrition facts and return ONLY a valid JSON object — no markdown, no explanation, no code blocks.
Use this exact structure:
{
  "name": "product name as shown on label",
  "servingSize": <number>,
  "servingUnit": "g or ml or scoop",
  "nutrition": {
    "calories": <number per serving>,
    "protein": <grams per serving>,
    "carbs": <grams per serving>,
    "fat": <grams per serving>,
    "sugar": <grams per serving>
  },
  "commonUnits": [
    { "unit": "1 scoop", "grams": <weight of one scoop in grams> }
  ]
}
If a value is not visible on the label, use 0.
If there is no scoop info, return an empty commonUnits array.`;

async function parseSupplementLabel(imageBuffer, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    { inlineData: { data: imageBuffer.toString('base64'), mimeType } },
    PARSE_PROMPT,
  ]);

  const raw = result.response.text().trim();
  const cleaned = raw.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
  return JSON.parse(cleaned);
}

const REVIEW_PROMPT = (payload) => `You are a fitness and nutrition coach AI. Analyze this user's weekly health data and give a structured review.

User Data (JSON):
${JSON.stringify(payload, null, 2)}

Return ONLY a valid JSON object — no markdown, no explanation, no code blocks — with this exact structure:
{
  "summary": "2-3 sentence overview of their week",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "issues": ["issue 1", "issue 2"],
  "recommendations": ["actionable tip 1", "actionable tip 2", "actionable tip 3", "actionable tip 4"],
  "grocerySuggestions": ["food item 1", "food item 2", "food item 3", "food item 4", "food item 5"]
}

Rules:
- Be specific, reference their actual numbers (calories, protein, etc.)
- strengths: 2-4 items, what they did well
- issues: 1-3 items, what needs improvement
- recommendations: 3-5 actionable, concrete steps for next week
- grocerySuggestions: 4-6 specific foods/ingredients that would help them hit their goals, consider Indian food context
- Keep each item to 1 sentence max`;

async function generateWeeklyReview(payload) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(REVIEW_PROMPT(payload));
  const raw     = result.response.text().trim();
  const cleaned = raw.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { parseSupplementLabel, generateWeeklyReview };
