package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"gofr.dev/pkg/gofr"
)

// RiskAssessment represents a transaction risk evaluation
type RiskAssessment struct {
	TxHash      string  `json:"txHash"`
	RiskScore   int     `json:"riskScore"`
	ThreatType  string  `json:"threatType"`
	Confidence  float64 `json:"confidence"`
	Reason      string  `json:"reason"`
	Timestamp   int64   `json:"timestamp"`
	IsBlocked   bool    `json:"isBlocked"`
}

// TransactionData represents incoming transaction for analysis
type TransactionData struct {
	Hash     string `json:"hash"`
	From     string `json:"from"`
	To       string `json:"to"`
	Value    string `json:"value"`
	GasLimit string `json:"gasLimit"`
	Data     string `json:"data"`
}

// ThreatAlert represents a security alert
type ThreatAlert struct {
	ID          string `json:"id"`
	Type        string `json:"type"`
	Severity    string `json:"severity"`
	Description string `json:"description"`
	Timestamp   int64  `json:"timestamp"`
	TxHash      string `json:"txHash"`
}

// FirewallStats represents system statistics
type FirewallStats struct {
	TransactionsScreened int64   `json:"transactionsScreened"`
	ExploitsBlocked     int64   `json:"exploitsBlocked"`
	FundsProtected      int64   `json:"fundsProtected"`
	FalsePositiveRate   float64 `json:"falsePositiveRate"`
	Uptime              string  `json:"uptime"`
}

var (
	// In-memory storage for demo (use Redis/DB in production)
	assessments = make(map[string]*RiskAssessment)
	alerts      = make([]*ThreatAlert, 0)
	stats       = &FirewallStats{
		TransactionsScreened: 15247,
		ExploitsBlocked:     27,
		FundsProtected:      2400000,
		FalsePositiveRate:   0.03,
		Uptime:              "99.97%",
	}
	
	// Known malicious patterns
	maliciousAddresses = map[string]bool{
		"0x1234567890abcdef1234567890abcdef12345678": true,
		"0xabcdef1234567890abcdef1234567890abcdef12": true,
		"0x9876543210fedcba9876543210fedcba98765432": true,
	}
	
	startTime = time.Now()
)

func main() {
	app := gofr.New()

	// CORS middleware
	app.Use(func(c *gofr.Context) {
		c.Response.Header().Set("Access-Control-Allow-Origin", "*")
		c.Response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.Response.WriteHeader(http.StatusOK)
			return
		}
		
		c.Next()
	})

	// Health check endpoint
	app.GET("/health", func(c *gofr.Context) (interface{}, error) {
		return map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now().Unix(),
			"uptime":    time.Since(startTime).String(),
			"service":   "DeFi Transaction Guard API",
		}, nil
	})

	// Risk scoring endpoint - core functionality
	app.POST("/api/risk-score", analyzeTransaction)
	
	// Get assessment by transaction hash
	app.GET("/api/assessment/{hash}", getAssessment)
	
	// Get firewall statistics
	app.GET("/api/stats", getStats)
	
	// Get recent alerts
	app.GET("/api/alerts", getAlerts)
	
	// Simulate exploit detection (for demo)
	app.POST("/api/simulate-exploit", simulateExploit)
	
	// WebSocket endpoint for real-time alerts (simplified)
	app.GET("/api/alerts/stream", streamAlerts)

	log.Println("🛡️ DeFi Transaction Guard API starting on :8080")
	log.Println("🔗 Powered by GoFr Framework")
	app.Start()
}

// analyzeTransaction performs AI-powered risk analysis
func analyzeTransaction(c *gofr.Context) (interface{}, error) {
	var txData TransactionData
	if err := c.Bind(&txData); err != nil {
		return nil, fmt.Errorf("invalid transaction data: %w", err)
	}

	// Simulate AI analysis with realistic patterns
	riskScore := calculateRiskScore(txData)
	threatType := identifyThreatType(txData, riskScore)
	confidence := calculateConfidence(riskScore)
	reason := generateReason(txData, threatType)
	
	assessment := &RiskAssessment{
		TxHash:     txData.Hash,
		RiskScore:  riskScore,
		ThreatType: threatType,
		Confidence: confidence,
		Reason:     reason,
		Timestamp:  time.Now().Unix(),
		IsBlocked:  riskScore > 80,
	}
	
	// Store assessment
	assessments[txData.Hash] = assessment
	
	// Update stats
	stats.TransactionsScreened++
	if assessment.IsBlocked {
		stats.ExploitsBlocked++
		stats.FundsProtected += 50000 // Simulate prevented loss
		
		// Create alert
		alert := &ThreatAlert{
			ID:          fmt.Sprintf("alert_%d", time.Now().UnixNano()),
			Type:        threatType,
			Severity:    getSeverity(riskScore),
			Description: fmt.Sprintf("Blocked %s with %d%% confidence", threatType, int(confidence*100)),
			Timestamp:   time.Now().Unix(),
			TxHash:      txData.Hash,
		}
		alerts = append([]*ThreatAlert{alert}, alerts...)
		
		// Keep only last 50 alerts
		if len(alerts) > 50 {
			alerts = alerts[:50]
		}
	}
	
	c.Logger.Infof("Risk assessment completed: %s -> %d%% risk", txData.Hash, riskScore)
	
	return assessment, nil
}

// calculateRiskScore uses heuristics to simulate AI risk scoring
func calculateRiskScore(tx TransactionData) int {
	score := 0
	
	// Check recipient address
	if maliciousAddresses[strings.ToLower(tx.To)] {
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
		score += 15 // Large transactions are riskier
	}
	
	// Check for suspicious data patterns
	if len(tx.Data) > 1000 {
		score += 10 // Complex calls might be exploits
	}
	
	// Add some randomness to simulate ML model uncertainty
	score += rand.Intn(20) - 10
	
	// Ensure score is within bounds
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}
	
	return score
}

// identifyThreatType categorizes the type of threat
func identifyThreatType(tx TransactionData, riskScore int) string {
	if maliciousAddresses[strings.ToLower(tx.To)] {
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

// calculateConfidence simulates ML model confidence
func calculateConfidence(riskScore int) float64 {
	base := float64(riskScore) / 100.0
	// Add some variance
	confidence := base + (rand.Float64()-0.5)*0.1
	
	if confidence < 0 {
		confidence = 0
	}
	if confidence > 1 {
		confidence = 1
	}
	
	return confidence
}

// generateReason provides human-readable explanation
func generateReason(tx TransactionData, threatType string) string {
	reasons := []string{
		"Suspicious gas limit and recipient pattern detected",
		"Known malicious contract interaction",
		"Unusual transaction value pattern",
		"Complex call data suggests exploit attempt",
		"Pattern matches known attack vectors",
	}
	
	if maliciousAddresses[strings.ToLower(tx.To)] {
		return "Recipient address flagged as malicious"
	}
	
	return reasons[rand.Intn(len(reasons))]
}

// getSeverity maps risk score to severity level
func getSeverity(riskScore int) string {
	if riskScore >= 90 {
		return "CRITICAL"
	}
	if riskScore >= 70 {
		return "HIGH"
	}
	if riskScore >= 40 {
		return "MEDIUM"
	}
	return "LOW"
}

// getAssessment retrieves stored assessment
func getAssessment(c *gofr.Context) (interface{}, error) {
	hash := c.PathParam("hash")
	
	assessment, exists := assessments[hash]
	if !exists {
		return nil, fmt.Errorf("assessment not found for hash: %s", hash)
	}
	
	return assessment, nil
}

// getStats returns firewall statistics
func getStats(c *gofr.Context) (interface{}, error) {
	// Add some real-time variance
	currentStats := *stats
	currentStats.TransactionsScreened += int64(rand.Intn(10))
	
	return currentStats, nil
}

// getAlerts returns recent security alerts
func getAlerts(c *gofr.Context) (interface{}, error) {
	limit := 20
	if len(alerts) < limit {
		limit = len(alerts)
	}
	
	return alerts[:limit], nil
}

// simulateExploit creates a fake exploit for demo purposes
func simulateExploit(c *gofr.Context) (interface{}, error) {
	exploitTypes := []string{
		"Flash Loan Attack",
		"Rug Pull Attempt", 
		"Liquidity Drain",
		"Sandwich Attack",
		"Governance Exploit",
	}
	
	exploitType := exploitTypes[rand.Intn(len(exploitTypes))]
	potentialLoss := rand.Intn(200000) + 50000
	
	// Create fake transaction
	txHash := fmt.Sprintf("0x%x", rand.Int63())
	
	assessment := &RiskAssessment{
		TxHash:     txHash,
		RiskScore:  85 + rand.Intn(15),
		ThreatType: exploitType,
		Confidence: 0.9 + rand.Float64()*0.1,
		Reason:     "Simulated exploit attempt for demo",
		Timestamp:  time.Now().Unix(),
		IsBlocked:  true,
	}
	
	assessments[txHash] = assessment
	
	// Create alert
	alert := &ThreatAlert{
		ID:          fmt.Sprintf("demo_alert_%d", time.Now().UnixNano()),
		Type:        exploitType,
		Severity:    "HIGH",
		Description: fmt.Sprintf("Prevented %s - saved $%d", exploitType, potentialLoss),
		Timestamp:   time.Now().Unix(),
		TxHash:      txHash,
	}
	
	alerts = append([]*ThreatAlert{alert}, alerts...)
	
	// Update stats
	stats.ExploitsBlocked++
	stats.FundsProtected += int64(potentialLoss)
	
	c.Logger.Infof("Simulated exploit blocked: %s", exploitType)
	
	return map[string]interface{}{
		"success":       true,
		"exploitType":   exploitType,
		"potentialLoss": potentialLoss,
		"assessment":    assessment,
		"alert":         alert,
	}, nil
}

// streamAlerts provides real-time alert streaming (simplified)
func streamAlerts(c *gofr.Context) (interface{}, error) {
	// In a real implementation, this would be a WebSocket connection
	// For demo, we'll return recent alerts with SSE headers
	
	c.Response.Header().Set("Content-Type", "text/event-stream")
	c.Response.Header().Set("Cache-Control", "no-cache")
	c.Response.Header().Set("Connection", "keep-alive")
	
	// Send recent alerts
	recentAlerts := alerts
	if len(recentAlerts) > 5 {
		recentAlerts = recentAlerts[:5]
	}
	
	return map[string]interface{}{
		"alerts": recentAlerts,
		"stats":  stats,
	}, nil
}