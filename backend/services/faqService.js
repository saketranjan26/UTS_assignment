import { FAQ } from "../db.js";
import llmService from "./llmService.js";

const SIMILARITY_THRESHOLD = 0.75;

const cosineSimilarity = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const matchFAQ = async (query) => {
  const queryEmbedding = await llmService.getEmbedding(query);
  const faqs = await FAQ.find({});

  let bestScore = 0;
  let bestFAQ = null;

  for (const faq of faqs) {
    const score = cosineSimilarity(queryEmbedding, faq.embedding);
    if (score > bestScore) {
      bestScore = score;
      bestFAQ = faq;
    }
  }

  if (bestScore >= SIMILARITY_THRESHOLD) {
    return bestFAQ.answer;
  }

  return null;
};

export default { matchFAQ };
