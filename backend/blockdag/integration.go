package blockdag

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

// BlockDAGIntegration handles BlockDAG network interactions
type BlockDAGIntegration struct {
	NodeURL    string
	APIKey     string
	NetworkID  string
	client     *http.Client
}

// BlockDAGTransaction represents a transaction on BlockDAG
type BlockDAGTransaction struct {
	Hash        string    `json:"hash"`
	From        string    `json:"from"`
	To          string    `json:"to"`
	Value       string    `json:"value"`
	GasUsed     int64     `json:"gasUsed"`
	Status      string    `json:"status"`
	Timestamp   time.Time `json:"timestamp"`
	BlockHeight int64     `json:"blockHeight"`
	DAGIndex    int64     `json:"dagIndex"`
}

// BlockDAGStats represents network statistics
type BlockDAGStats struct {
	TotalTransactions int64   `json:"totalTransactions"`
	TPS              float64 `json:"tps"`
	NetworkHashRate  string  `json:"networkHashRate"`
	ActiveNodes      int     `json:"activeNodes"`
	DAGSize          int64   `json:"dagSize"`
	Finality         string  `json:"finality"`
}

// RiskProfile represents a contract's risk assessment on BlockDAG
type RiskProfile struct {
	ContractAddress string    `json:"contractAddress"`
	RiskScore       int       `json:"riskScore"`
	ThreatLevel     string    `json:"threatLevel"`
	LastUpdated     time.Time `json:"lastUpdated"`
	Incidents       int       `json:"incidents"`
	Reputation      float64   `json:"reputation"`
}

// NewBlockDAGIntegration creates a new BlockDAG integration instance
func NewBlockDAGIntegration() (*BlockDAGIntegration, error) {
	nodeURL := os.Getenv("BLOCKDAG_NODE_URL")
	if nodeURL == "" {
		nodeURL = "https://rpc.blockdag.network" // Default BlockDAG RPC
	}
	
	apiKey := os.Getenv("BLOCKDAG_API_KEY")
	networkID := os.Getenv("BLOCKDAG_NETWORK_ID")
	if networkID == "" {
		networkID = "mainnet"
	}
	
	return &BlockDAGIntegration{
		NodeURL:   nodeURL,
		APIKey:    apiKey,
		NetworkID: networkID,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}, nil
}

// GetTransaction retrieves a transaction from BlockDAG network
func (b *BlockDAGIntegration) GetTransaction(txHash string) (*BlockDAGTransaction, error) {
	url := fmt.Sprintf("%s/api/v1/transaction/%s", b.NodeURL, txHash)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}
	
	var tx BlockDAGTransaction
	if err := json.NewDecoder(resp.Body).Decode(&tx); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	return &tx, nil
}

// GetNetworkStats retrieves current BlockDAG network statistics
func (b *BlockDAGIntegration) GetNetworkStats() (*BlockDAGStats, error) {
	url := fmt.Sprintf("%s/api/v1/stats", b.NodeURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}
	
	var stats BlockDAGStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	return &stats, nil
}

// UpdateRiskProfile updates a contract's risk profile on BlockDAG
func (b *BlockDAGIntegration) UpdateRiskProfile(contractAddress string, riskScore int, threatLevel string) error {
	profile := RiskProfile{
		ContractAddress: contractAddress,
		RiskScore:       riskScore,
		ThreatLevel:     threatLevel,
		LastUpdated:     time.Now(),
		Incidents:       0,
		Reputation:      calculateReputation(riskScore),
	}
	
	data, err := json.Marshal(profile)
	if err != nil {
		return fmt.Errorf("failed to marshal risk profile: %w", err)
	}
	
	url := fmt.Sprintf("%s/api/v1/risk-profile", b.NodeURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	log.Printf("✅ Updated BlockDAG risk profile for %s: %d%% risk", contractAddress, riskScore)
	return nil
}

// GetRiskProfile retrieves a contract's risk profile from BlockDAG
func (b *BlockDAGIntegration) GetRiskProfile(contractAddress string) (*RiskProfile, error) {
	url := fmt.Sprintf("%s/api/v1/risk-profile/%s", b.NodeURL, contractAddress)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}
	
	var profile RiskProfile
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	return &profile, nil
}

// SubmitTransaction submits a transaction to BlockDAG network
func (b *BlockDAGIntegration) SubmitTransaction(tx map[string]interface{}) (string, error) {
	data, err := json.Marshal(tx)
	if err != nil {
		return "", fmt.Errorf("failed to marshal transaction: %w", err)
	}
	
	url := fmt.Sprintf("%s/api/v1/transaction", b.NodeURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(data))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}
	
	txHash, ok := result["hash"].(string)
	if !ok {
		return "", fmt.Errorf("invalid response format: missing transaction hash")
	}
	
	return txHash, nil
}

// ValidateDAGStructure validates the DAG structure integrity
func (b *BlockDAGIntegration) ValidateDAGStructure() (bool, error) {
	url := fmt.Sprintf("%s/api/v1/dag/validate", b.NodeURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return false, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, fmt.Errorf("failed to decode response: %w", err)
	}
	
	valid, ok := result["valid"].(bool)
	if !ok {
		return false, fmt.Errorf("invalid response format")
	}
	
	return valid, nil
}

// GetDAGTips retrieves current DAG tips for transaction ordering
func (b *BlockDAGIntegration) GetDAGTips() ([]string, error) {
	url := fmt.Sprintf("%s/api/v1/dag/tips", b.NodeURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}
	
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	tipsInterface, ok := result["tips"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid response format")
	}
	
	tips := make([]string, len(tipsInterface))
	for i, tip := range tipsInterface {
		tips[i] = tip.(string)
	}
	
	return tips, nil
}

// calculateReputation calculates reputation score based on risk score
func calculateReputation(riskScore int) float64 {
	// Higher risk = lower reputation
	reputation := float64(100-riskScore) / 100.0
	if reputation < 0 {
		reputation = 0
	}
	return reputation
}

// GetHealthStatus checks BlockDAG network health
func (b *BlockDAGIntegration) GetHealthStatus() (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v1/health", b.NodeURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	if b.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+b.APIKey)
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := b.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}
	
	var health map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	return health, nil
}