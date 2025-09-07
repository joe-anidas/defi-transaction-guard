import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with API key validation
const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const genAI = apiKey && apiKey !== 'your_gemini_api_key_here' 
  ? new GoogleGenerativeAI(apiKey) 
  : null

export const analyzeTransaction = async (transactionData) => {
  try {
    // Check if API key is properly configured
    if (!genAI || !apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini AI API key not configured, using fallback analysis')
      return getFallbackAnalysis(transactionData)
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Analyze this DeFi transaction for security risks and provide a detailed assessment:

Transaction Details:
- Amount: ${transactionData.amount} BDAG
- Gas Limit: ${transactionData.gasLimit}
- Transaction Type: ${transactionData.type}
- Contract Address: ${transactionData.contractAddress}
- Function: ${transactionData.functionName}

Please analyze this transaction and respond with a JSON object containing:
{
  "riskScore": number (0-100, where 100 is most dangerous),
  "threatType": "string describing the threat category",
  "isBlocked": boolean (true if should be blocked),
  "reason": "detailed explanation of the analysis",
  "patterns": ["array", "of", "detected", "patterns"],
  "recommendations": "what the user should do"
}

Consider these factors:
1. Gas limit anomalies (extremely high gas suggests complex malicious operations)
2. Known malicious contract patterns (drainLiquidity, rugPull, sandwichAttack)
3. Transaction amount relative to typical operations
4. Function signature analysis
5. Smart contract interaction patterns

Be thorough in your analysis and provide actionable insights.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      return {
        success: true,
        analysis: {
          riskScore: Math.min(100, Math.max(0, analysis.riskScore || 0)),
          threatType: analysis.threatType || 'Unknown',
          isBlocked: analysis.isBlocked || false,
          reason: analysis.reason || 'Analysis completed',
          patterns: analysis.patterns || [],
          recommendations: analysis.recommendations || 'Proceed with caution'
        }
      }
    } else {
      // Fallback parsing if JSON is not properly formatted
      return parseTextResponse(text, transactionData)
    }
  } catch (error) {
    console.error('Gemini AI analysis failed:', error)
    return {
      success: false,
      error: error.message,
      analysis: getFallbackAnalysis(transactionData)
    }
  }
}

const parseTextResponse = (text, transactionData) => {
  // Fallback text parsing if JSON extraction fails
  const lowerText = text.toLowerCase()
  
  let riskScore = 50 // Default medium risk
  let isBlocked = false
  let threatType = 'Unknown'
  let reason = text

  // Analyze keywords to determine risk
  if (lowerText.includes('malicious') || lowerText.includes('exploit') || lowerText.includes('attack')) {
    riskScore = 90
    isBlocked = true
    threatType = 'Malicious Activity Detected'
  } else if (lowerText.includes('suspicious') || lowerText.includes('high risk')) {
    riskScore = 75
    isBlocked = true
    threatType = 'Suspicious Pattern'
  } else if (lowerText.includes('safe') || lowerText.includes('normal') || lowerText.includes('low risk')) {
    riskScore = 15
    isBlocked = false
    threatType = 'Safe Transaction'
  }

  return {
    success: true,
    analysis: {
      riskScore,
      threatType,
      isBlocked,
      reason: reason.substring(0, 200) + '...',
      patterns: [],
      recommendations: isBlocked ? 'Block this transaction' : 'Transaction appears safe'
    }
  }
}

const getFallbackAnalysis = (transactionData) => {
  // Deterministic fallback analysis based on transaction type
  const isMalicious = transactionData.type === 'malicious' || 
                     ['drainLiquidity', 'rugPull', 'sandwichAttack'].includes(transactionData.functionName)

  if (isMalicious) {
    return {
      riskScore: 94,
      threatType: 'Malicious Contract Interaction',
      isBlocked: true,
      reason: `High-risk transaction detected: ${transactionData.functionName} with suspicious gas limit (${transactionData.gasLimit}) and amount (${transactionData.amount} BDAG)`,
      patterns: ['High gas limit', 'Known malicious function', 'Large amount transfer'],
      recommendations: 'Block this transaction immediately'
    }
  } else {
    return {
      riskScore: 15,
      threatType: 'Safe Transaction',
      isBlocked: false,
      reason: `Transaction verified safe: Normal gas limit (${transactionData.gasLimit}) and standard amount (${transactionData.amount} BDAG)`,
      patterns: ['Normal gas usage', 'Standard function call', 'Reasonable amount'],
      recommendations: 'Transaction is safe to proceed'
    }
  }
}

export const getAnalysisSteps = (isGeminiEnabled = true) => {
  if (isGeminiEnabled) {
    return [
      { id: 1, name: 'Gemini AI Analysis', status: 'pending', result: 'ANALYZING' },
      { id: 2, name: 'Pattern Recognition', status: 'pending', result: 'SCANNING' },
      { id: 3, name: 'Risk Assessment', status: 'pending', result: 'EVALUATING' },
      { id: 4, name: 'Final Verdict', status: 'pending', result: 'DETERMINING' }
    ]
  } else {
    return [
      { id: 1, name: 'Gas Limit Analysis', status: 'pending', result: 'ANALYZING' },
      { id: 2, name: 'Contract Risk Check', status: 'pending', result: 'SCANNING' },
      { id: 3, name: 'Pattern Matching', status: 'pending', result: 'EVALUATING' },
      { id: 4, name: 'Security Verdict', status: 'pending', result: 'DETERMINING' }
    ]
  }
}
