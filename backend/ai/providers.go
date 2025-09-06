package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

// AIProvider interface for different AI services
type AIProvider interface {
	AnalyzeTransaction(txData TransactionData) (*AIAnalysisResult, error)
	GetProviderName() string
	IsAvailable() bool
}

// TransactionData represents transaction for AI analysis
type TransactionData struct {
	Hash     string `json:"hash"`
	From     string `json:"from"`
	To       string `json:"to"`
	Value    string `json:"value"`
	GasLimit string `json:"gasLimit"`
	Data     string `json:"data"`
}

// AIAnalysisResult represents AI analysis response
type AIAnalysisResult struct {
	RiskScore   int     `json:"riskScore"`
	ThreatType  string  `json:"threatType"`
	Confidence  float64 `json:"confidence"`
	Reasoning   string  `json:"reasoning"`
	Provider    string  `json:"provider"`
	Indicators  []string `json:"indicators"`
	ProcessTime int64   `json:"processTime"`
}

// GrokProvider implements Grok AI analysis
type GrokProvider struct {
	APIKey     string
	BackupKey  string
	BaseURL    string
	HTTPClient *http.Client
}

// GeminiProvider implements Gemini AI analysis
type GeminiProvider struct {
	APIKey     string
	BackupKey  string
	BaseURL    string
	HTTPClient *http.Client
}

// NewGrokProvider creates a new Grok AI provider
func NewGrokProvider() *GrokProvider {
	return &GrokProvider{
		APIKey:    os.Getenv("GROK_API_KEY"),
		BackupKey: os.Getenv("GROK_API_2"),
		BaseURL:   "https://api.groq.com/openai/v1/chat/completions",
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// NewGeminiProvider creates a new Gemini AI provider
func NewGeminiProvider() *GeminiProvider {
	return &GeminiProvider{
		APIKey:    os.Getenv("GEMINI_API_KEY"),
		BackupKey: os.Getenv("GEMINI_API_2"),
		BaseURL:   "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// AnalyzeTransaction implements AI analysis using Grok
func (g *GrokProvider) AnalyzeTransaction(txData TransactionData) (*AIAnalysisResult, error) {
	startTime := time.Now()
	
	// Validate input data
	if err := validateTransactionData(txData); err != nil {
		return nil, fmt.Errorf("invalid transaction data: %w", err)
	}
	
	prompt := g.buildAnalysisPrompt(txData)
	
	// Try primary API key first with retry logic
	result, err := g.callGrokAPIWithRetry(g.APIKey, prompt)
	if err != nil && g.BackupKey != "" {
		// Fallback to backup key with retry logic
		result, err = g.callGrokAPIWithRetry(g.BackupKey, prompt)
	}
	
	if err != nil {
		return nil, fmt.Errorf("grok analysis failed: %w", err)
	}
	
	result.Provider = "grok"
	result.ProcessTime = time.Since(startTime).Milliseconds()
	
	return result, nil
}

// AnalyzeTransaction implements AI analysis using Gemini
func (g *GeminiProvider) AnalyzeTransaction(txData TransactionData) (*AIAnalysisResult, error) {
	startTime := time.Now()
	
	// Validate input data
	if err := validateTransactionData(txData); err != nil {
		return nil, fmt.Errorf("invalid transaction data: %w", err)
	}
	
	prompt := g.buildAnalysisPrompt(txData)
	
	// Try primary API key first with retry logic
	result, err := g.callGeminiAPIWithRetry(g.APIKey, prompt)
	if err != nil && g.BackupKey != "" {
		// Fallback to backup key with retry logic
		result, err = g.callGeminiAPIWithRetry(g.BackupKey, prompt)
	}
	
	if err != nil {
		return nil, fmt.Errorf("gemini analysis failed: %w", err)
	}
	
	result.Provider = "gemini"
	result.ProcessTime = time.Since(startTime).Milliseconds()
	
	return result, nil
}

// GetProviderName returns the provider name
func (g *GrokProvider) GetProviderName() string {
	return "grok"
}

func (g *GeminiProvider) GetProviderName() string {
	return "gemini"
}

// IsAvailable checks if the provider is available
func (g *GrokProvider) IsAvailable() bool {
	return g.APIKey != ""
}

func (g *GeminiProvider) IsAvailable() bool {
	return g.APIKey != ""
}

// buildAnalysisPrompt creates the AI prompt for transaction analysis
func (g *GrokProvider) buildAnalysisPrompt(txData TransactionData) string {
	return fmt.Sprintf(`Analyze this DeFi transaction for security risks and potential exploits:

Transaction Details:
- Hash: %s
- From: %s
- To: %s
- Value: %s
- Gas Limit: %s
- Data: %s

Please analyze for:
1. Flash loan attack patterns
2. Rug pull indicators
3. Liquidity drain attempts
4. Sandwich attack signatures
5. Governance exploit patterns
6. Unusual gas usage
7. Suspicious contract interactions

Respond with a JSON object containing:
{
  "riskScore": <0-100 integer>,
  "threatType": "<specific threat type or 'Normal Transaction'>",
  "confidence": <0.0-1.0 float>,
  "reasoning": "<detailed explanation>",
  "indicators": ["<list of risk indicators found>"]
}

Focus on actionable security insights. Risk score should be 0-30 for normal, 31-70 for suspicious, 71-100 for high risk.`, 
		txData.Hash, txData.From, txData.To, txData.Value, txData.GasLimit, txData.Data)
}

func (g *GeminiProvider) buildAnalysisPrompt(txData TransactionData) string {
	return fmt.Sprintf(`You are a DeFi security expert. Analyze this blockchain transaction for potential exploits and security risks:

Transaction:
Hash: %s
From: %s  
To: %s
Value: %s
Gas Limit: %s
Call Data: %s

Security Analysis Required:
- Flash loan attack detection
- Rug pull pattern recognition  
- MEV/sandwich attack identification
- Governance exploit detection
- Unusual gas patterns
- Malicious contract interactions

Return analysis as JSON:
{
  "riskScore": <integer 0-100>,
  "threatType": "<threat classification>", 
  "confidence": <float 0.0-1.0>,
  "reasoning": "<security assessment>",
  "indicators": ["<risk factors>"]
}

Risk Scoring:
0-30: Normal transaction
31-70: Suspicious activity  
71-100: High risk/exploit attempt`, 
		txData.Hash, txData.From, txData.To, txData.Value, txData.GasLimit, txData.Data)
}

// callGrokAPI makes the actual API call to Grok
func (g *GrokProvider) callGrokAPI(apiKey, prompt string) (*AIAnalysisResult, error) {
	requestBody := map[string]interface{}{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": "You are a DeFi security expert specializing in real-time exploit detection. Respond only with valid JSON.",
			},
			{
				"role":    "user", 
				"content": prompt,
			},
		},
		"temperature":   0.1,
		"max_tokens":    1000,
		"response_format": map[string]string{"type": "json_object"},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", g.BaseURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := g.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var grokResponse struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&grokResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(grokResponse.Choices) == 0 {
		return nil, fmt.Errorf("no response from Grok API")
	}

	// Parse the AI response JSON
	var result AIAnalysisResult
	if err := json.Unmarshal([]byte(grokResponse.Choices[0].Message.Content), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &result, nil
}

// callGeminiAPI makes the actual API call to Gemini
func (g *GeminiProvider) callGeminiAPI(apiKey, prompt string) (*AIAnalysisResult, error) {
	requestBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.1,
			"maxOutputTokens": 1000,
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("%s?key=%s", g.BaseURL, apiKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := g.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var geminiResponse struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geminiResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(geminiResponse.Candidates) == 0 || len(geminiResponse.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no response from Gemini API")
	}

	// Parse the AI response JSON
	var result AIAnalysisResult
	responseText := geminiResponse.Candidates[0].Content.Parts[0].Text
	
	// Extract JSON from response (Gemini might include extra text)
	start := bytes.Index([]byte(responseText), []byte("{"))
	end := bytes.LastIndex([]byte(responseText), []byte("}"))
	if start == -1 || end == -1 {
		return nil, fmt.Errorf("no valid JSON found in response")
	}
	
	jsonResponse := responseText[start : end+1]
	if err := json.Unmarshal([]byte(jsonResponse), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &result, nil
}

// validateTransactionData validates transaction input data
func validateTransactionData(txData TransactionData) error {
	if txData.Hash == "" {
		return fmt.Errorf("transaction hash is required")
	}
	
	if txData.From == "" {
		return fmt.Errorf("from address is required")
	}
	
	if txData.To == "" {
		return fmt.Errorf("to address is required")
	}
	
	// Validate Ethereum address format
	if !isValidAddress(txData.From) {
		return fmt.Errorf("invalid from address format")
	}
	
	if !isValidAddress(txData.To) {
		return fmt.Errorf("invalid to address format")
	}
	
	// Validate hash format (should be 66 characters starting with 0x)
	if !isValidHash(txData.Hash) {
		return fmt.Errorf("invalid transaction hash format")
	}
	
	return nil
}

// isValidAddress validates Ethereum address format
func isValidAddress(address string) bool {
	matched, _ := regexp.MatchString(`^0x[a-fA-F0-9]{40}$`, address)
	return matched
}

// isValidHash validates transaction hash format
func isValidHash(hash string) bool {
	matched, _ := regexp.MatchString(`^0x[a-fA-F0-9]{64}$`, hash)
	return matched
}

// callGrokAPIWithRetry implements retry logic for Grok API calls
func (g *GrokProvider) callGrokAPIWithRetry(apiKey, prompt string) (*AIAnalysisResult, error) {
	maxRetries := 3
	baseDelay := 1 * time.Second
	
	for attempt := 0; attempt < maxRetries; attempt++ {
		result, err := g.callGrokAPI(apiKey, prompt)
		if err == nil {
			return result, nil
		}
		
		// Check if error is retryable
		if !isRetryableError(err) {
			return nil, err
		}
		
		if attempt < maxRetries-1 {
			// Exponential backoff with jitter
			delay := time.Duration(float64(baseDelay) * math.Pow(2, float64(attempt)))
			jitter := time.Duration(float64(delay) * 0.1 * (math.Floor(rand.Float64()*21) - 10)) // ±10% jitter
			delay += jitter
			
			log.Printf("Retrying Grok API call in %v (attempt %d/%d)", delay, attempt+1, maxRetries)
			time.Sleep(delay)
		}
	}
	
	return nil, fmt.Errorf("Grok API failed after %d attempts", maxRetries)
}

// callGeminiAPIWithRetry implements retry logic for Gemini API calls
func (g *GeminiProvider) callGeminiAPIWithRetry(apiKey, prompt string) (*AIAnalysisResult, error) {
	maxRetries := 3
	baseDelay := 1 * time.Second
	
	for attempt := 0; attempt < maxRetries; attempt++ {
		result, err := g.callGeminiAPI(apiKey, prompt)
		if err == nil {
			return result, nil
		}
		
		// Check if error is retryable
		if !isRetryableError(err) {
			return nil, err
		}
		
		if attempt < maxRetries-1 {
			// Exponential backoff with jitter
			delay := time.Duration(float64(baseDelay) * math.Pow(2, float64(attempt)))
			jitter := time.Duration(float64(delay) * 0.1 * (math.Floor(rand.Float64()*21) - 10)) // ±10% jitter
			delay += jitter
			
			log.Printf("Retrying Gemini API call in %v (attempt %d/%d)", delay, attempt+1, maxRetries)
			time.Sleep(delay)
		}
	}
	
	return nil, fmt.Errorf("Gemini API failed after %d attempts", maxRetries)
}

// isRetryableError determines if an error is retryable
func isRetryableError(err error) bool {
	if err == nil {
		return false
	}
	
	errStr := strings.ToLower(err.Error())
	
	// Network errors are retryable
	if strings.Contains(errStr, "timeout") ||
		strings.Contains(errStr, "connection") ||
		strings.Contains(errStr, "network") ||
		strings.Contains(errStr, "temporary") {
		return true
	}
	
	// Rate limit errors are retryable
	if strings.Contains(errStr, "rate limit") ||
		strings.Contains(errStr, "too many requests") ||
		strings.Contains(errStr, "429") {
		return true
	}
	
	// Server errors (5xx) are retryable
	if strings.Contains(errStr, "500") ||
		strings.Contains(errStr, "502") ||
		strings.Contains(errStr, "503") ||
		strings.Contains(errStr, "504") {
		return true
	}
	
	return false
}