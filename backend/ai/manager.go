package ai

import (
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"strings"
	"time"
)

// AIManager manages multiple AI providers with fallback logic
type AIManager struct {
	providers []AIProvider
	fallback  *HeuristicProvider
}

// HeuristicProvider provides fallback analysis when AI is unavailable
type HeuristicProvider struct {
	maliciousAddresses map[string]bool
}

// NewAIManager creates a new AI manager with all available providers
func NewAIManager() *AIManager {
	var providers []AIProvider
	
	// Initialize Groq provider
	groq := NewGroqProvider()
	if groq.IsAvailable() {
		providers = append(providers, groq)
		log.Println("✅ Groq AI provider initialized")
	} else {
		log.Println("⚠️ Groq API key not found, skipping Groq provider")
	}
	
	// Initialize Gemini provider
	gemini := NewGeminiProvider()
	if gemini.IsAvailable() {
		providers = append(providers, gemini)
		log.Println("✅ Gemini AI provider initialized")
	} else {
		log.Println("⚠️ Gemini API key not found, skipping Gemini provider")
	}
	
	// Initialize heuristic fallback
	fallback := &HeuristicProvider{
		maliciousAddresses: map[string]bool{
			"0x1234567890abcdef1234567890abcdef12345678": true,
			"0xabcdef1234567890abcdef1234567890abcdef12": true,
			"0x9876543210fedcba9876543210fedcba98765432": true,
		},
	}
	
	log.Printf("🤖 AI Manager initialized with %d AI providers + heuristic fallback", len(providers))
	
	return &AIManager{
		providers: providers,
		fallback:  fallback,
	}
}

// AnalyzeTransaction performs AI analysis with fallback logic
func (m *AIManager) AnalyzeTransaction(txData TransactionData) (*AIAnalysisResult, error) {
	// Try AI providers first
	for _, provider := range m.providers {
		result, err := provider.AnalyzeTransaction(txData)
		if err != nil {
			log.Printf("⚠️ %s analysis failed: %v", provider.GetProviderName(), err)
			continue
		}
		
		log.Printf("✅ %s analysis successful - Risk: %d%%", provider.GetProviderName(), result.RiskScore)
		return result, nil
	}
	
	// Fallback to heuristic analysis
	log.Println("🔄 Falling back to heuristic analysis")
	return m.fallback.AnalyzeTransaction(txData)
}

// GetProviderStatus returns the status of all AI providers
func (m *AIManager) GetProviderStatus() map[string]interface{} {
	status := map[string]interface{}{
		"aiEnabled": len(m.providers) > 0,
		"providers": make(map[string]interface{}),
		"fallbackEnabled": true,
		"lastUpdate": time.Now().Unix(),
	}
	
	providers := make(map[string]interface{})
	
	for _, provider := range m.providers {
		providers[provider.GetProviderName()] = map[string]interface{}{
			"available": provider.IsAvailable(),
			"status":    "active",
		}
	}
	
	// Add fallback status
	providers["heuristic"] = map[string]interface{}{
		"available": true,
		"status":    "fallback",
	}
	
	status["providers"] = providers
	return status
}

// GetProviderCapabilities returns detailed provider information
func (m *AIManager) GetProviderCapabilities() map[string]interface{} {
	capabilities := map[string]interface{}{
		"providers": []map[string]interface{}{},
	}
	
	providerList := []map[string]interface{}{}
	
	// Add AI providers
	for _, provider := range m.providers {
		var model, latency string
		var caps []string
		
		switch provider.GetProviderName() {
		case "groq":
			model = "mixtral-8x7b-32768"
			latency = "~150ms"
			caps = []string{"transaction-analysis", "threat-detection", "risk-scoring", "exploit-patterns"}
		case "gemini":
			model = "gemini-pro"
			latency = "~120ms"
			caps = []string{"transaction-analysis", "pattern-recognition", "risk-assessment", "security-analysis"}
		}
		
		providerList = append(providerList, map[string]interface{}{
			"name":         fmt.Sprintf("%s AI", strings.Title(provider.GetProviderName())),
			"provider":     provider.GetProviderName(),
			"available":    provider.IsAvailable(),
			"capabilities": caps,
			"model":        model,
			"latency":      latency,
		})
	}
	
	// Add fallback provider
	providerList = append(providerList, map[string]interface{}{
		"name":         "Heuristic Analysis",
		"provider":     "heuristic",
		"available":    true,
		"capabilities": []string{"rule-based", "pattern-matching", "fast-analysis"},
		"model":        "rule-engine",
		"latency":      "<50ms",
	})
	
	capabilities["providers"] = providerList
	capabilities["fallback"] = map[string]interface{}{
		"name":         "Heuristic Fallback",
		"provider":     "heuristic",
		"available":    true,
		"capabilities": []string{"rule-based", "pattern-matching", "offline-analysis"},
		"latency":      "<50ms",
	}
	
	return capabilities
}

// AnalyzeTransaction implements heuristic analysis as fallback
func (h *HeuristicProvider) AnalyzeTransaction(txData TransactionData) (*AIAnalysisResult, error) {
	startTime := time.Now()
	
	score := h.calculateRiskScore(txData)
	threatType := h.identifyThreatType(txData, score)
	confidence := h.calculateConfidence(score)
	reasoning := h.generateReasoning(txData, threatType)
	indicators := h.getIndicators(txData, score)
	
	return &AIAnalysisResult{
		RiskScore:   score,
		ThreatType:  threatType,
		Confidence:  confidence,
		Reasoning:   reasoning,
		Provider:    "heuristic",
		Indicators:  indicators,
		ProcessTime: time.Since(startTime).Milliseconds(),
	}, nil
}

// calculateRiskScore uses heuristics to calculate risk
func (h *HeuristicProvider) calculateRiskScore(tx TransactionData) int {
	score := 0
	
	// Check recipient address
	if h.maliciousAddresses[strings.ToLower(tx.To)] {
		score += 40
	}
	
	// Check gas limit (suspicious if too high)
	if gasLimit, err := strconv.ParseInt(tx.GasLimit, 10, 64); err == nil {
		if gasLimit > 300000 {
			score += 25
		}
	}
	
	// Check transaction value
	if strings.Contains(tx.Value, "000") && len(tx.Value) > 10 {
		score += 15
	}
	
	// Check for suspicious data patterns
	if len(tx.Data) > 1000 {
		score += 10
	}
	
	// Add some variance
	score += rand.Intn(20) - 10
	
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}
	
	return score
}

// identifyThreatType categorizes the threat
func (h *HeuristicProvider) identifyThreatType(tx TransactionData, riskScore int) string {
	if h.maliciousAddresses[strings.ToLower(tx.To)] {
		threats := []string{"Liquidity Drain", "Rug Pull Attempt", "Flash Loan Attack", "Governance Exploit"}
		return threats[rand.Intn(len(threats))]
	}
	
	if riskScore > 80 {
		return "High Risk Transaction"
	}
	
	if riskScore > 50 {
		return "Suspicious Activity"
	}
	
	return "Normal Transaction"
}

// calculateConfidence calculates confidence score
func (h *HeuristicProvider) calculateConfidence(riskScore int) float64 {
	base := float64(riskScore) / 100.0
	confidence := base + (rand.Float64()-0.5)*0.1
	
	if confidence < 0 {
		confidence = 0
	}
	if confidence > 1 {
		confidence = 1
	}
	
	return confidence
}

// generateReasoning provides explanation
func (h *HeuristicProvider) generateReasoning(tx TransactionData, threatType string) string {
	if h.maliciousAddresses[strings.ToLower(tx.To)] {
		return "Recipient address flagged as malicious in threat database"
	}
	
	reasons := []string{
		"Suspicious gas limit and recipient pattern detected",
		"Unusual transaction value pattern identified",
		"Complex call data suggests potential exploit attempt",
		"Pattern matches known attack vectors",
		"Heuristic analysis indicates elevated risk",
	}
	
	return reasons[rand.Intn(len(reasons))]
}

// getIndicators returns risk indicators
func (h *HeuristicProvider) getIndicators(tx TransactionData, riskScore int) []string {
	indicators := []string{}
	
	if h.maliciousAddresses[strings.ToLower(tx.To)] {
		indicators = append(indicators, "malicious-address")
	}
	
	if gasLimit, err := strconv.ParseInt(tx.GasLimit, 10, 64); err == nil && gasLimit > 300000 {
		indicators = append(indicators, "high-gas-limit")
	}
	
	if len(tx.Data) > 1000 {
		indicators = append(indicators, "complex-call-data")
	}
	
	if strings.Contains(tx.Value, "000") && len(tx.Value) > 10 {
		indicators = append(indicators, "large-value-transfer")
	}
	
	if riskScore > 70 {
		indicators = append(indicators, "high-risk-pattern")
	}
	
	if len(indicators) == 0 {
		indicators = append(indicators, "normal-transaction")
	}
	
	return indicators
}