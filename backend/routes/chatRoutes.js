import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is not configured on the server." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemInstruction = `You are a helpful and intelligent AI assistant built into an EV (Electric Vehicle) trip planner application called 'OnWheel EV'.
Your goal is to help users with EV-related queries such as finding charging stations, optimizing routes, battery management, troubleshooting EV issues, and general advice about electric vehicles.
Be concise, polite, and practical. Format your responses with markdown if necessary.`;
        
        const contents = [];
        if (history && history.length > 0) {
            for (const msg of history) {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                });
            }
        }
        
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        res.json({ response: response.text });
    } catch (error) {
        console.error("Error in chat route:", error);
        res.status(500).json({ error: "Failed to process chat message.", details: error.message });
    }
});

export default router;
