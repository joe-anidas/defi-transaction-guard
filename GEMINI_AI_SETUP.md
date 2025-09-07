# Gemini AI Integration Setup

This application uses Google's Gemini AI to provide intelligent transaction analysis and risk assessment.

## Quick Setup

1. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Configure the environment:**
   - Open `frontend/.env`
   - Replace `your_gemini_api_key_here` with your actual API key:
     ```
     VITE_GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

3. **Test the integration:**
   - Start the frontend: `npm run dev`
   - Navigate to the Live Demo page
   - Try executing both "Malicious Contract" and "Good Transaction" buttons
   - The AI will analyze each transaction and provide risk assessment

## Features

- **Real-time Analysis**: Each transaction is analyzed by Gemini AI for security risks
- **Risk Scoring**: Transactions receive a risk score from 0-100
- **Intelligent Blocking**: High-risk transactions are automatically blocked
- **Detailed Explanations**: AI provides detailed reasoning for its decisions
- **Fallback System**: If API key is not configured, the system uses demo data

## Troubleshooting

- **API Key Issues**: Ensure your API key is valid and has billing enabled
- **Rate Limits**: Gemini AI has usage limits; the app includes retry logic
- **Network Issues**: The app falls back to demo data if AI service is unavailable

## Demo Mode

If you prefer to test without setting up Gemini AI, the application will automatically use simulated analysis data when:
- No API key is provided
- API key is set to the default placeholder
- Gemini API is unavailable
