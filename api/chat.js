// Vercel serverless function. Configure GROQ_API_KEY in the Vercel project
// environment settings; do not commit the secret to the repository.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Chatbot is not configured on the server." });
  }

  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  const context = typeof req.body?.context === "string" ? req.body.context.slice(0, 12000) : "";
  if (!question) {
    return res.status(400).json({ error: "Please enter a question." });
  }

  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.7,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for Rohit Raj's portfolio. Answer using only the portfolio context below. Do not invent personal details or claim experience not listed. If the context does not contain an answer, say so. Keep replies under 60 words.\n\nPORTFOLIO CONTEXT:\n" + context
          },
          { role: "user", content: question }
        ]
      })
    });

    if (upstream.status === 429) {
      return res.status(429).json({ error: "Too many requests. Please wait and try again." });
    }
    if (!upstream.ok) {
      console.error("Groq API returned status", upstream.status);
      return res.status(502).json({ error: "AI service is temporarily unavailable." });
    }

    const data = await upstream.json();
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({ error: "The AI returned an empty response." });
    }

    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    console.error("Chat function error:", error);
    return res.status(500).json({ error: "Unable to process the chat request." });
  }
};
