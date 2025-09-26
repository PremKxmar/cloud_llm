import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Check if user is authenticated
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create context for medical/health-related conversations
    const systemPrompt = `You are a helpful medical assistant chatbot for a doctor appointment platform. 
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
    - If asked about specific doctors or appointments, direct users to use the platform features
    
    Current user message: ${message}`;

    // Build conversation context
    let conversationContext = systemPrompt + "\n\nConversation history:\n";
    
    // Add conversation history (limit to last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    conversationContext += `\nUser: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const botMessage = response.text();

    return NextResponse.json({
      message: botMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Chatbot API error:", error);
    
    // Handle specific API errors
    if (error.message.includes("API key")) {
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    );
  }
}
