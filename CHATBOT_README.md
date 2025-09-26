# Chatbot Integration Setup Guide

This guide explains how to set up the Gemini AI-powered chatbot in your doctors appointment application.

## Features Added

- **AI-Powered Medical Assistant**: Uses Google's Gemini AI to provide health information and guidance
- **Patient-Only Access**: Chatbot only appears for patients and unassigned users
- **Responsive Design**: Works on both desktop and mobile devices
- **Conversation History**: Maintains context throughout the conversation
- **Minimizable Interface**: Can be minimized to save screen space
- **Real-time Chat**: Instant responses with typing indicators

## Setup Instructions

### 1. Install Dependencies
The required package has been automatically installed:
```bash
npm install @google/generative-ai
```

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Configure Environment Variables
1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Restart Your Development Server
```bash
npm run dev
```

## How It Works

### For Patients:
- When logged in as a patient, a blue chat icon appears in the bottom-right corner
- Clicking the icon opens the chat interface
- Users can ask health-related questions and get AI-powered responses
- The chatbot provides general health information but always reminds users to consult healthcare providers for serious issues

### For Doctors/Admins:
- The chatbot does not appear to avoid interface clutter
- Doctors and admins have their own specialized interfaces

## Files Added/Modified

### New Files:
- `app/api/chatbot/route.js` - API endpoint for Gemini AI integration
- `app/api/user-role/route.js` - API endpoint to check user roles
- `components/chatbot.jsx` - Main chatbot UI component
- `components/chatbot-wrapper.jsx` - Wrapper component that handles user role checking
- `.env.example` - Environment variables template

### Modified Files:
- `app/layout.js` - Added ChatBotWrapper component
- `package.json` - Added @google/generative-ai dependency

## Chatbot Capabilities

The AI assistant can help with:
- General health questions and symptoms
- Medical procedure explanations
- Wellness and prevention tips
- When to seek medical care
- Appointment-related guidance
- Medication information (general)
- Health condition explanations

## Important Notes

- The chatbot provides general information only and doesn't replace professional medical advice
- All conversations are processed by Google's Gemini AI
- The chatbot is designed to be helpful while encouraging users to seek professional medical care when appropriate
- Conversation history is maintained during the session but not stored permanently

## Customization Options

You can customize the chatbot by modifying:
- `components/chatbot.jsx` - UI appearance and behavior
- `app/api/chatbot/route.js` - AI prompts and response handling
- `components/chatbot-wrapper.jsx` - User role logic and display conditions

## Troubleshooting

### Chatbot doesn't appear:
1. Make sure you're logged in as a patient
2. Check if GEMINI_API_KEY is set correctly in .env.local
3. Restart the development server

### API errors:
1. Verify your Gemini API key is valid
2. Check the browser console for error messages
3. Ensure you have internet connectivity

### Styling issues:
1. Make sure all Tailwind CSS classes are available
2. Check if shadcn/ui components are properly installed

## Future Enhancements

Potential improvements you could add:
- Conversation persistence in database
- Voice input/output capabilities
- Integration with appointment booking
- Multilingual support
- Advanced medical knowledge base integration
