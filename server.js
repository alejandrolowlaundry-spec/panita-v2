require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const OpenAI  = require("openai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Eres Panita, una asistente virtual simpática y cálida de una panadería venezolana. Respondes siempre en español natural y amigable, como en una conversación real de WhatsApp. Ayudas a los clientes con preguntas sobre productos, precios y pedidos. Tus respuestas son cortas, máximo 3 líneas.`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 300,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ reply: "Disculpa, tuve un problema. ¿Puedes repetir? 😅" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Panita server running → http://localhost:${PORT}`);
});
