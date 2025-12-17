import { QueryStat, FAQ } from "../db.js";
import llmService from "./llmService.js";

const PROMOTION_THRESHOLD = 5;
const SIMILARITY_THRESHOLD = 0.80;

const cosineSimilarity = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const trackQuery = async (query, answer) => {
  const embedding = await llmService.getEmbedding(query);
  const stats = await QueryStat.find({ promoted: false });

  let best = null;
  let bestScore = 0;

  for (const stat of stats) {
    const score = cosineSimilarity(embedding, stat.embedding);
    if (score > bestScore) {
      bestScore = score;
      best = stat;
    }
  }

  if (best && bestScore >= SIMILARITY_THRESHOLD) {
    best.count += 1;
    best.lastSeenAt = new Date();

    if (best.count >= PROMOTION_THRESHOLD) {
      await FAQ.create({
        question: best.query,
        answer,
        embedding: best.embedding
      });
      best.promoted = true;
    }

    await best.save();
    return;
  }

  await QueryStat.create({
    query,
    embedding
  });
};

export default { trackQuery };
