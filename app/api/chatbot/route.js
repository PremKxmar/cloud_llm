import OpenAI from "openai";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// Initialize OpenRouter client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request) {
  try {
    console.log("Chatbot API called");
    
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Check if user is authenticated
    const user = await currentUser();
    if (!user) {
      console.log("User not authenticated");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();
    console.log("Received message:", message);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("OpenRouter client initialized");

    // Create system message for medical assistant
    const systemMessage = {
      role: "system",
      content: `You are a helpful medical assistant chatbot for a doctor appointment platform. 
      Your role is to:
      1. Provide general health information and guidance
      2. Help users understand symptoms and when to seek medical care
      3. Assist with appointment-related questions
      4. Offer health tips and wellness advice
      5. Answer questions about medical procedures, treatments, and conditions
      
      Important guidelines:
      - Always remind users that your advice doesn't replace professional medical diagnosis
      - For serious symptoms, always recommend consulting a healthcare provider
      - Be empathetic and supportive
      - Provide accurate, evidence-based information
      - Keep responses concise but informative
      - If asked about specific doctors or appointments, direct users to use the platform features`
    };

    // Build conversation messages
    const messages = [systemMessage];
    
    // Add conversation history (limit to last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
    
    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    console.log("Sending request to OpenRouter...");

    // Generate response using OpenRouter
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat", // Using DeepSeek model through OpenRouter
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const botMessage = completion.choices[0].message.content;

    return NextResponse.json({
      message: botMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Chatbot API error:", error);
    console.error("Error stack:", error.stack);
    
    // Handle specific API errors
    if (error.message.includes("API key") || error.message.includes("API_KEY")) {
      return NextResponse.json(
        { error: "AI service configuration error. Please check API key." },
        { status: 500 }
      );
    }
    
    if (error.message.includes("quota") || error.message.includes("limit")) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to generate response: ${error.message}` },
      { status: 500 }
    );
  }
}
