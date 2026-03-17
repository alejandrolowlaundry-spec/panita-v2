require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const OpenAI  = require("openai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️  OPENAI_API_KEY is not set — chat will return fallback responses");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing" });

const SYSTEM_PROMPT = `Eres Panita, un asistente virtual inteligente diseñado para negocios venezolanos. Tu objetivo es demostrarle al dueño del negocio que te está probando que Panita puede transformar su negocio respondiendo clientes 24/7 por WhatsApp.

Sé muy cálido, entusiasta y natural — como un amigo que le da un buen consejo. Usa emojis con moderación.

Cuando el usuario llegue, preséntate así:
'¡Hola! 👋 Soy Panita, el asistente que va a atender a tus clientes por WhatsApp mientras tú descansas. ¿Quieres ver cómo funciono? Pregúntame lo que sea 😄'

Durante la conversación:
- Muestra cómo puedes responder preguntas de clientes
- Destaca que trabajas 24/7 sin descanso
- Menciona que funciona con cualquier celular venezolano
- Si preguntan por precio o planes di que pueden escribir al WhatsApp oficial para más info
- Siempre termina con una pregunta para mantener la conversación activa
- Máximo 3 líneas por respuesta — corto y directo

Nunca salgas del personaje. Siempre en español venezolano natural y amigable.`;

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
