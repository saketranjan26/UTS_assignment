const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings";
const EMBED_MODEL = "nomic-embed-text";
const RESPONSE_MODEL = "llama3.1";

const buildPrompt = (query, history) => {
  let context = "";

  for (const msg of history) {
    context += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
  }

  context += `User: ${query}\nAssistant:`;

  return `
        You are an AI customer support assistant.

        If the query cannot be answered confidently or requires human assistance,
        reply ONLY with:
        ESCALATE

        Otherwise, answer clearly and concisely.

        Conversation:
        ${context}
        `;
};

const getResponse = async (query, history) => {
  try {
    const prompt = buildPrompt(query, history);

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: RESPONSE_MODEL,
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    const text = data.response.trim();

    if (text.toUpperCase().includes("ESCALATE")) {
      return {
        answer: "This issue requires human assistance.",
        needEscalation: true
      };
    }

    return {
      answer: text,
      needEscalation: false
    };
  } catch (error) {
    console.error("LLM service error:", error);
    return {
      answer: "Unable to process your request right now.",
      needEscalation: true
    };
  }
};

const getEmbedding = async (text) => {
  const res = await fetch(OLLAMA_EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBED_MODEL,
      prompt: text
    })
  });

  const data = await res.json();
  return data.embedding;
};

export default {
  getResponse,
  getEmbedding
};
