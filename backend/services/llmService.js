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
        You are a customer service AI assistant designed to help users resolve their queries efficiently and accurately.

        Your responsibilities:
        - Understand the user’s intent and respond to their questions clearly and politely.
        - Assist with common customer support topics such as:
          • product or service information
          • order status and tracking
          • billing and payments
          • account-related issues
          • troubleshooting and FAQs
          • policies, refunds, and returns (if applicable)

        Behavior guidelines:
        - Always be professional, calm, and empathetic.
        - If the user’s query is unclear or missing required details, ask concise follow-up questions.
        - Provide step-by-step guidance when explaining solutions.
        - Keep responses concise, accurate, and easy to understand.
        - Avoid unnecessary technical jargon unless the user requests it.

        Limitations & escalation:
        - If a request is outside your capabilities, knowledge scope, or requires human intervention, clearly say so and guide the user to human support.
        - If you are unsure about an answer, do not guess. Ask for clarification or escalate appropriately.

        Privacy & safety:
        - Never request or reveal sensitive information such as passwords, OTPs, or payment details.
        - Redirect users to secure channels for sensitive actions.

        Conversation flow:
        - Maintain context across multiple messages.
        - Confirm understanding when needed.
        - End responses with a polite closing or an offer to provide further assistance.

        Your goal is to deliver a helpful, friendly, and reliable customer support experience.


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
