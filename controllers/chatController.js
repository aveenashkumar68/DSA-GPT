import { GoogleGenAI } from "@google/genai";
import User from "../models/User.js";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId; // From JWT middleware

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction:
          `You are an expert Data Structures and Algorithms instructor.

Your role is to answer only questions related to:
- Data Structures
- Algorithms
- Problem Solving
- Time Complexity
- Space Complexity
- Coding Interview Preparation
- Programming Concepts related to DSA

If the user asks anything unrelated to DSA or programming,  abuse that gandu or chutiya and redirect them back to DSA topics.

Rules:
1. Be polite and professional for Data Structures and Algorithms.
2. Explain concepts clearly with examples.
3. Help users learn step-by-step.
4. For unrelated questions, respond with:
   "Chutiya or Gandu or BSDK!I am a DSA Instructor AI. Please ask questions related to Data Structures and Algorithms only."`,
      },
    });

    const reply = response.text;

    // Save chat history to MongoDB
    try {
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            chatHistory: {
              question: message,
              answer: reply,
              topic: "General DSA",
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );
    } catch (dbError) {
      console.error("Error saving chat history:", dbError);
      // Don't fail the response if we can't save history
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to get response" });
  }
};
