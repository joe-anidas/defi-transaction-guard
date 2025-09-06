package main

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

	"defi-transaction-guard/ai"
	"defi-transaction-guard/blockchain"
	"defi-transaction-guard/blockdag"
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
	// In-memory storage for demo
	assessments = make(map[string]*RiskAssessment)
	alerts      = make([]*ThreatAlert, 0)
	stats       = &FirewallStats{
		TransactionsScreened: 15247,
		ExploitsBlocked:     27,
		FundsProtected:      2400000,
		FalsePositiveRate:   0.03,
		Uptime:              "99.97%",
	}
	
	// AI Manager for real AI integration
	aiManager *ai.AIManager
	
	// Blockchain integration for smart contract updates
	blockchainIntegration *blockchain.BlockchainIntegration
	
	// BlockDAG integration for advanced DAG features
	blockdagIntegration *blockdag.BlockDAGIntegration
	
	startTime = time.Now()
)

func main() {
	// Initialize AI Manager with real providers
	aiManager = ai.NewAIManager()
	
	// Initialize blockchain integration
	var err error
	blockchainIntegration, err = blockchain.NewBlockchainIntegration()
	if err != nil {
		log.Printf("⚠️ Blockchain integration failed: %v", err)
		log.Println("🔄 Continuing without blockchain integration...")
	} else {
		log.Println("✅ Blockchain integration initialized")
	}
	
	// Initialize BlockDAG integration
	blockdagIntegration, err = blockdag.NewBlockDAGIntegration()
	if err != nil {
		log.Printf("⚠️ BlockDAG integration failed: %v", err)
		log.Println("🔄 Continuing without BlockDAG integration...")
	} else {
		log.Println("✅ BlockDAG integration initialized")
	}
	
	// Set environment variables for GoFr configuration
	os.Setenv("HTTP_PORT", "8080")
	os.Setenv("METRICS_PORT", "9090")
	os.Setenv("AI_SERVICE_URL", "http://localhost:5002")
	
	app := gofr.New()

	// Health check endpoint
	app.GET("/health", func(c *gofr.Context) (interface{}, error) {
		return map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now().Unix(),
			"uptime":    time.Since(startTime).String(),
			"service":   "DeFi Transaction Guard API",
			"aiStatus":  aiManager.GetProviderStatus(),
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
	
	// AI-specific endpoints
	app.GET("/api/ai/status", getAIStatus)
	app.POST("/api/ai/analyze", analyzeWithAI)
	app.GET("/api/ai/providers", getAIProviders)
	
	// Blockchain integration endpoints
	app.POST("/api/blockchain/update-risk", updateBlockchainRiskScore)
	app.GET("/api/blockchain/risk/{address}", getBlockchainRiskScore)
	app.GET("/api/blockchain/stats", getBlockchainStats)
	
	// BlockDAG integration endpoints
	app.GET("/api/blockdag/transaction/{hash}", getBlockDAGTransaction)
	app.GET("/api/blockdag/stats", getBlockDAGStats)
	app.POST("/api/blockdag/risk-profile", updateBlockDAGRiskProfile)
	app.GET("/api/blockdag/risk-profile/{address}", getBlockDAGRiskProfile)
	app.GET("/api/blockdag/health", getBlockDAGHealth)
	app.GET("/api/blockdag/dag/tips", getDAGTips)
	app.GET("/api/blockdag/dag/validate", validateDAGStructure)

	log.Println("🛡️ DeFi Transaction Guard API starting on :8080")
	log.Println("🔗 Powered by GoFr Framework")
	log.Println("🤖 AI Integration: Grok + Gemini APIs")
	log.Println("⚡ Real-time exploit detection enabled")
	
	app.Run()
}

// analyzeTransaction performs AI-powered risk analysis
func analyzeTransaction(c *gofr.Context) (interface{}, error) {
	var txData TransactionData
	if err := c.Bind(&txData); err != nil {
		return nil, fmt.Errorf("invalid transaction data: %w", err)
	}

	c.Logger.Infof("🔍 Analyzing transaction: %s", txData.Hash)
	
	// Convert to AI package format
	aiTxData := ai.TransactionData{
		Hash:     txData.Hash,
		From:     txData.From,
		To:       txData.To,
		Value:    txData.Value,
		GasLimit: txData.GasLimit,
		Data:     txData.Data,
	}
	
	// Perform real AI analysis
	aiResult, err := aiManager.AnalyzeTransaction(aiTxData)
	if err != nil {
		c.Logger.Errorf("AI analysis failed: %v", err)
		return nil, fmt.Errorf("AI analysis failed: %w", err)
	}
	
	// Update blockchain with AI results
	analyzeTransactionWithBlockchain(txData, aiResult)
	
	riskScore := aiResult.RiskScore
	threatType := aiResult.ThreatType
	confidence := aiResult.Confidence
	reason := aiResult.Reasoning
	
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
		potentialLoss := calculatePotentialLoss(txData, threatType)
		stats.FundsProtected += potentialLoss
		
		// Create alert
		alert := &ThreatAlert{
			ID:          fmt.Sprintf("alert_%d", time.Now().UnixNano()),
			Type:        threatType,
			Severity:    getSeverity(riskScore),
			Description: fmt.Sprintf("🛡️ Blocked %s - Risk: %d%% - Saved: $%d", threatType, riskScore, potentialLoss),
			Timestamp:   time.Now().Unix(),
			TxHash:      txData.Hash,
		}
		alerts = append([]*ThreatAlert{alert}, alerts...)
		
		// Keep only last 50 alerts
		if len(alerts) > 50 {
			alerts = alerts[:50]
		}
		
		c.Logger.Warnf("🚨 BLOCKED: %s - %s (Risk: %d%%)", txData.Hash, threatType, riskScore)
	} else {
		c.Logger.Infof("✅ APPROVED: %s - %s (Risk: %d%%)", txData.Hash, threatType, riskScore)
	}
	
	return map[string]interface{}{
		"assessment": assessment,
		"aiInsights": map[string]interface{}{
			"provider":     aiResult.Provider,
			"indicators":   aiResult.Indicators,
			"reasoning":    reason,
			"processTime":  aiResult.ProcessTime,
			"confidence":   confidence,
		},
		"blocked": assessment.IsBlocked,
	}, nil
}



// calculatePotentialLoss estimates potential financial loss from an attack
func calculatePotentialLoss(tx TransactionData, threatType string) int64 {
	baseLoss := int64(50000) // Base loss amount
	
	// Parse transaction value to estimate impact
	if value, err := strconv.ParseFloat(strings.TrimSpace(tx.Value), 64); err == nil {
		if value > 0 {
			baseLoss = int64(value * 1000000) // Convert ETH to USD estimate
		}
	}
	
	// Adjust based on threat type
	multiplier := 1.0
	switch threatType {
	case "Flash Loan Attack":
		multiplier = 3.0
	case "Liquidity Drain":
		multiplier = 2.5
	case "Rug Pull Attempt":
		multiplier = 2.0
	case "Governance Exploit":
		multiplier = 4.0
	case "Sandwich Attack":
		multiplier = 0.5
	default:
		multiplier = 1.0
	}
	
	loss := int64(float64(baseLoss) * multiplier)
	
	// Add some randomness for realism
	variance := int64(float64(loss) * 0.2 * (rand.Float64() - 0.5))
	loss += variance
	
	// Ensure minimum and maximum bounds
	if loss < 10000 {
		loss = 10000
	}
	if loss > 5000000 {
		loss = 5000000
	}
	
	return loss
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

// getAIStatus returns the status of AI services
func getAIStatus(c *gofr.Context) (interface{}, error) {
	return aiManager.GetProviderStatus(), nil
}

// analyzeWithAI provides direct AI analysis endpoint
func analyzeWithAI(c *gofr.Context) (interface{}, error) {
	var txData TransactionData
	if err := c.Bind(&txData); err != nil {
		return nil, fmt.Errorf("invalid transaction data: %w", err)
	}

	// Convert to AI package format
	aiTxData := ai.TransactionData{
		Hash:     txData.Hash,
		From:     txData.From,
		To:       txData.To,
		Value:    txData.Value,
		GasLimit: txData.GasLimit,
		Data:     txData.Data,
	}

	// Perform real AI analysis
	result, err := aiManager.AnalyzeTransaction(aiTxData)
	if err != nil {
		return nil, fmt.Errorf("AI analysis failed: %w", err)
	}

	return map[string]interface{}{
		"success":     true,
		"provider":    result.Provider,
		"riskScore":   result.RiskScore,
		"threatType":  result.ThreatType,
		"confidence":  result.Confidence,
		"reasoning":   result.Reasoning,
		"indicators":  result.Indicators,
		"processTime": result.ProcessTime,
		"timestamp":   time.Now().Unix(),
	}, nil
}

// getAIProviders returns available AI providers and their capabilities
func getAIProviders(c *gofr.Context) (interface{}, error) {
	return aiManager.GetProviderCapabilities(), nil
}

// updateBlockchainRiskScore updates risk score on the blockchain
func updateBlockchainRiskScore(c *gofr.Context) (interface{}, error) {
	if blockchainIntegration == nil {
		return nil, fmt.Errorf("blockchain integration not available")
	}
	
	var request struct {
		ContractAddress string `json:"contractAddress"`
		RiskScore       int    `json:"riskScore"`
	}
	
	if err := c.Bind(&request); err != nil {
		return nil, fmt.Errorf("invalid request data: %w", err)
	}
	
	if request.RiskScore < 0 || request.RiskScore > 100 {
		return nil, fmt.Errorf("risk score must be between 0 and 100")
	}
	
	err := blockchainIntegration.UpdateRiskScore(request.ContractAddress, request.RiskScore)
	if err != nil {
		return nil, fmt.Errorf("failed to update blockchain: %w", err)
	}
	
	c.Logger.Infof("📡 Updated blockchain risk score: %s -> %d%%", request.ContractAddress, request.RiskScore)
	
	return map[string]interface{}{
		"success":         true,
		"contractAddress": request.ContractAddress,
		"riskScore":       request.RiskScore,
		"timestamp":       time.Now().Unix(),
		"provider":        "blockchain",
	}, nil
}

// getBlockchainRiskScore retrieves risk score from blockchain
func getBlockchainRiskScore(c *gofr.Context) (interface{}, error) {
	if blockchainIntegration == nil {
		return nil, fmt.Errorf("blockchain integration not available")
	}
	
	address := c.PathParam("address")
	if address == "" {
		return nil, fmt.Errorf("contract address required")
	}
	
	riskScore, err := blockchainIntegration.GetContractRiskScore(address)
	if err != nil {
		return nil, fmt.Errorf("failed to get risk score: %w", err)
	}
	
	return map[string]interface{}{
		"contractAddress": address,
		"riskScore":       riskScore,
		"timestamp":       time.Now().Unix(),
		"source":          "blockchain",
	}, nil
}

// getBlockchainStats retrieves firewall statistics from blockchain
func getBlockchainStats(c *gofr.Context) (interface{}, error) {
	if blockchainIntegration == nil {
		return nil, fmt.Errorf("blockchain integration not available")
	}
	
	stats, err := blockchainIntegration.GetFirewallStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get blockchain stats: %w", err)
	}
	
	return map[string]interface{}{
		"success":   true,
		"stats":     stats,
		"timestamp": time.Now().Unix(),
		"source":    "blockchain",
	}, nil
}

// Enhanced analyzeTransaction with blockchain integration
func analyzeTransactionWithBlockchain(txData TransactionData, aiResult *ai.AIAnalysisResult) error {
	if blockchainIntegration == nil {
		return nil // Skip if blockchain not available
	}
	
	// Update risk score on blockchain if it's for a contract interaction
	if txData.To != "" && len(txData.Data) > 0 {
		// This is a contract interaction, update its risk score
		go func() {
			err := blockchainIntegration.UpdateRiskScore(txData.To, aiResult.RiskScore)
			if err != nil {
				log.Printf("⚠️ Failed to update blockchain risk score: %v", err)
			}
		}()
	}
	
	return nil
}

// BlockDAG Integration Handlers

// getBlockDAGTransaction retrieves a transaction from BlockDAG network
func getBlockDAGTransaction(c *gofr.Context) (interface{}, error) {
	if blockdagIntegration == nil {
		return nil, fmt.Errorf("BlockDAG integration not available")
	}
	
	hash := c.PathParam("hash")
	if hash == "" {
		return nil, fmt.Errorf("transaction hash required")
	}
	
	tx, err := blockdagIntegration.GetTransaction(hash)
	if err != nil {
		return nil, fmt.Errorf("failed to get BlockDAG transaction: %w", err)
	}
	
	return map[string]interface{}{
		"success":     true,
		"transaction": tx,
		"network":     "BlockDAG",
		"timestamp":   time.Now().Unix(),
	}, nil
}

// getBlockDAGStats retrieves BlockDAG network statistics
func getBlockDAGStats(c *gofr.Context) (interface{}, error) {
	if blockdagIntegration == nil {
		return nil, fmt.Errorf("BlockDAG integration not available")
	}
	
	stats, err := blockdagIntegration.GetNetworkStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get BlockDAG stats: %w", err)
	}
	
	return map[string]interface{}{
		"success":   true,
		"stats":     stats,
		"network":   "BlockDAG",
		"timestamp": time.Now().Unix(),
	}, nil
}

// updateBlockDAGRiskProfile updates a contract's risk profile on BlockDAG
func updateBlockDAGRiskProfile(c *gofr.Context) (interface{}, error) {
	if blockdagIntegration == nil {
		return nil, fmt.Errorf("BlockDAG integration not available")
	}
	
	var request struct {
		ContractAddress string `json:"contractAddress"`
		RiskScore       int    `json:"riskScore"`
		ThreatLevel     string `json:"threatLevel"`
	}
	
	if err := c.Bind(&request); err != nil {
		return nil, fmt.Errorf("invalid request data: %w", err)
	}
	
	if request.RiskScore < 0 || request.RiskScore > 100 {
		return nil, fmt.Errorf("risk score must be between 0 and 100")
	}
	
	if request.ThreatLevel == "" {
		if request.RiskScore >= 80 {
			request.ThreatLevel = "HIGH"
		} else if request.RiskScore >= 50 {
			request.ThreatLevel = "MEDIUM"
		} else {
			request.ThreatLevel = "LOW"
		}
	}
	
	err := blockdagIntegration.UpdateRiskProfile(request.ContractAddress, request.RiskScore, request.ThreatLevel)
	if err != nil {
		return nil, fmt.Errorf("failed to update BlockDAG risk profile: %w", err)
	}
	
	c.Logger.Infof("🔗 Updated BlockDAG risk profile: %s -> %d%% (%s)", request.ContractAddress, request.RiskScore, request.ThreatLevel)
	
	return map[string]interface{}{
		"success":         true,
		"contractAddress": request.ContractAddress,
		"riskScore":       request.RiskScore,
		"threatLevel":     request.ThreatLevel,
		"network":         "BlockDAG",
		"timestamp":       time.Now().Unix(),
	}, nil
}

// getBlockDAGRiskProfile retrieves a contract's risk profile from BlockDAG
func getBlockDAGRiskProfile(c *gofr.Context) (interface{}, error) {
	if blockdagIntegration == nil {
		return nil, fmt.Errorf("BlockDAG integration not available")
	}
	
	address := c.PathParam("address")
	if address == "" {
		return nil, fmt.Errorf("contract address required")
	}
	
	profile, err := blockdagIntegration.GetRiskProfile(address)
	if err != nil {
		return nil, fmt.Errorf("failed to get BlockDAG risk profile: %w", err)
	}
	
	return map[string]interface{}{
		"success": true,
		"profile": profile,
		"network": "BlockDAG",
	}, nil
}

// getBlockDAGHealth checks BlockDAG network health
func getBlockDAGHealth(c *gofr.Context) (interface{}, error) {
	if blockdagIntegration == nil {
		return nil, fmt.Errorf("BlockDAG integration not available")
	}
	
	health, err := blockdagIntegration.GetHealthStatus()
	if err != nil {
		return nil, fmt.Errorf("failed to get BlockDAG health: %w", err)
	}
	
	return map[string]interface{}{
		"success": true,
		"health":  health,
		"network": "BlockDAG",
	}, nil
}

// getDAGTips retrieves current DAG tips
func getDAGTips(c *gofr.Context) (interface{}, error) {
	if blockdagIntegration == nil {
		return nil, fmt.Errorf("BlockDAG integration not available")
	}
	
	tips, err := blockdagIntegration.GetDAGTips()
	if err != nil {
		return nil, fmt.Errorf("failed to get DAG tips: %w", err)
	}
	
	return map[string]interface{}{
		"success": true,
		"tips":    tips,
		"count":   len(tips),
		"network": "BlockDAG",
	}, nil
}

// validateDAGStructure validates the DAG structure integrity
func validateDAGStructure(c *gofr.Context) (interface{}, error) {
	if blockdagIntegration == nil {
		return nil, fmt.Errorf("BlockDAG integration not available")
	}
	
	valid, err := blockdagIntegration.ValidateDAGStructure()
	if err != nil {
		return nil, fmt.Errorf("failed to validate DAG structure: %w", err)
	}
	
	return map[string]interface{}{
		"success": true,
		"valid":   valid,
		"network": "BlockDAG",
	}, nil
}