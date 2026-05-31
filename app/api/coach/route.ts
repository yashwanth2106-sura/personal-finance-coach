import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are a friendly personal finance coach. Give practical, specific advice in simple language. User asks: ${message}`
        }
      ],
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Sorry, something went wrong. Please try again!" });
  }
}