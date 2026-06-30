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

function extractJSON(raw) {
  // Strip markdown code fences (any variant)
  let text = raw.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
  // Find the outermost { } block in case there's surrounding text
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`No JSON object in Gemini response: ${text.substring(0, 200)}`);
  return JSON.parse(text.substring(start, end + 1));
}

async function parseSupplementLabel(imageBuffer, mimeType = 'image/jpeg') {
  const safeMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)
    ? mimeType : 'image/jpeg';

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const result = await model.generateContent(
    [{ inlineData: { data: imageBuffer.toString('base64'), mimeType: safeMime } }, PARSE_PROMPT],
    { timeout: 20000 },
  );
  return extractJSON(result.response.text().trim());
}

const REVIEW_PROMPT = (payload) => `Fitness coach AI. Analyze this weekly data and return ONLY valid JSON, no markdown.

${JSON.stringify(payload)}

JSON structure (exactly):
{"summary":"2-3 sentence overview","strengths":["s1","s2"],"issues":["i1"],"recommendations":["r1","r2","r3"],"grocerySuggestions":["f1","f2","f3","f4"]}

Rules: be specific with numbers, Indian food context for grocery list, 1 sentence per item.`;

async function generateWeeklyReview(payload) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  const result = await model.generateContent(REVIEW_PROMPT(payload), { timeout: 20000 });
  return extractJSON(result.response.text().trim());
}

module.exports = { parseSupplementLabel, generateWeeklyReview };
