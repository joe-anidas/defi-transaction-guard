package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// TestTransaction represents a test transaction for AI analysis
type TestTransaction struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Expected    string          `json:"expected"`
	Data        TransactionData `json:"data"`
}

// AIResponse represents the response from AI analysis
type AIResponse struct {
	RiskScore  int     `json:"riskScore"`
	ThreatType string  `json:"threatType"`
	Confidence float64 `json:"confidence"`
	Reasoning  string  `json:"reasoning"`
	Provider   string  `json:"provider"`
}

// TestAIIntegration runs comprehensive tests of the AI integration
func TestAIIntegration() {
	fmt.Println("🧪 Testing DeFi Transaction Guard AI Integration...")
	fmt.Println("=" + strings.Repeat("=", 60))

	// Test transactions covering different scenarios
	testTransactions := []TestTransaction{
		{
			Name:        "Normal DEX Swap",
			Description: "Regular Uniswap token swap",
			Expected:    "LOW_RISK",
			Data: TransactionData{
				Hash:     "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
				From:     "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
				To:       "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap Router
				Value:    "0.1",
				GasLimit: "150000",
				Data:     "0x38ed1739000000000000000000000000000000000000000000000000016345785d8a0000",
			},
		},
		{
			Name:        "Suspicious Flash Loan",
			Description: "Large flash loan with complex interactions",
			Expected:    "HIGH_RISK",
			Data: TransactionData{
				Hash:     "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
				From:     "0x1234567890abcdef1234567890abcdef12345678", // Known malicious
				To:       "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Balancer Vault
				Value:    "1000",
				GasLimit: "800000", // Very high gas
				Data:     "0x945bcec9" + strings.Repeat("0", 1000), // Complex call data
			},
		},
		{
			Name:        "Potential Rug Pull",
			Description: "Large liquidity removal by contract owner",
			Expected:    "HIGH_RISK",
			Data: TransactionData{
				Hash:     "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
				From:     "0x9876543210fedcba9876543210fedcba98765432", // Known malicious
				To:       "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", // Uniswap Factory
				Value:    "500",
				GasLimit: "400000",
				Data:     "0x02751cec000000000000000000000000000000000000000000000000000000000000000",
			},
		},
		{
			Name:        "Normal Lending",
			Description: "Standard Aave lending transaction",
			Expected:    "LOW_RISK",
			Data: TransactionData{
				Hash:     "0x567890abcdef567890abcdef567890abcdef567890abcdef567890abcdef567890",
				From:     "0x8ba1f109551bD432803012645Hac136c22C57592",
				To:       "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", // Aave Lending Pool
				Value:    "5",
				GasLimit: "200000",
				Data:     "0xe8eda9df000000000000000000000000a0b86a33e6776808d5f67d9434b0e5b5cc2360",
			},
		},
	}

	// Test AI service status
	fmt.Println("\n📊 Testing AI Service Status...")
	testAIStatus()

	// Test each transaction
	fmt.Println("\n🔍 Testing Transaction Analysis...")
	for i, test := range testTransactions {
		fmt.Printf("\n%d. %s\n", i+1, test.Name)
		fmt.Printf("   Description: %s\n", test.Description)
		fmt.Printf("   Expected: %s\n", test.Expected)
		
		result := testTransactionAnalysis(test.Data)
		if result != nil {
			fmt.Printf("   ✅ Result: Risk=%d%%, Threat=%s, Provider=%s\n", 
				result.RiskScore, result.ThreatType, result.Provider)
			
			// Validate result against expectation
			validateResult(test.Expected, result)
		} else {
			fmt.Printf("   ❌ Analysis failed\n")
		}
		
		time.Sleep(1 * time.Second) // Rate limiting
	}

	// Test provider comparison
	fmt.Println("\n🤖 Testing Provider Comparison...")
	testProviderComparison()

	fmt.Println("\n🎉 AI Integration Testing Complete!")
}

// testAIStatus tests the AI service status endpoint
func testAIStatus() {
	resp, err := http.Get("http://localhost:8080/api/ai/status")
	if err != nil {
		fmt.Printf("   ❌ Status check failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	var status map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
		fmt.Printf("   ❌ Failed to decode status: %v\n", err)
		return
	}

	fmt.Printf("   ✅ AI Service Status: %v\n", status["aiEnabled"])
	if providers, ok := status["providers"].(map[string]interface{}); ok {
		for name, info := range providers {
			if providerInfo, ok := info.(map[string]interface{}); ok {
				fmt.Printf("   📡 %s: %v\n", name, providerInfo["status"])
			}
		}
	}
}

// testTransactionAnalysis tests AI analysis for a specific transaction
func testTransactionAnalysis(txData TransactionData) *AIResponse {
	jsonData, err := json.Marshal(txData)
	if err != nil {
		fmt.Printf("   ❌ Failed to marshal transaction: %v\n", err)
		return nil
	}

	resp, err := http.Post("http://localhost:8080/api/ai/analyze", 
		"application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("   ❌ Analysis request failed: %v\n", err)
		return nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Printf("   ❌ Failed to decode result: %v\n", err)
		return nil
	}

	if !result["success"].(bool) {
		fmt.Printf("   ❌ Analysis failed\n")
		return nil
	}

	return &AIResponse{
		RiskScore:  int(result["riskScore"].(float64)),
		ThreatType: result["threatType"].(string),
		Confidence: result["confidence"].(float64),
		Reasoning:  result["reasoning"].(string),
		Provider:   result["provider"].(string),
	}
}

// validateResult checks if the analysis result matches expectations
func validateResult(expected string, result *AIResponse) {
	var expectedRisk string
	switch {
	case result.RiskScore >= 80:
		expectedRisk = "HIGH_RISK"
	case result.RiskScore >= 50:
		expectedRisk = "MEDIUM_RISK"
	default:
		expectedRisk = "LOW_RISK"
	}

	if expectedRisk == expected {
		fmt.Printf("   ✅ Validation: PASSED (%s)\n", expectedRisk)
	} else {
		fmt.Printf("   ⚠️  Validation: Expected %s, got %s\n", expected, expectedRisk)
	}
}

// testProviderComparison tests different AI providers
func testProviderComparison() {
	resp, err := http.Get("http://localhost:8080/api/ai/providers")
	if err != nil {
		fmt.Printf("   ❌ Provider check failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	var providers map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&providers); err != nil {
		fmt.Printf("   ❌ Failed to decode providers: %v\n", err)
		return
	}

	fmt.Printf("   📊 Available Providers:\n")
	if providerList, ok := providers["providers"].([]interface{}); ok {
		for _, p := range providerList {
			if provider, ok := p.(map[string]interface{}); ok {
				fmt.Printf("      • %s (%s) - Available: %v\n", 
					provider["name"], provider["model"], provider["available"])
			}
		}
	}
}

// Run tests if this file is executed directly
func init() {
	// Uncomment to run tests automatically
	// go func() {
	//     time.Sleep(2 * time.Second) // Wait for server to start
	//     TestAIIntegration()
	// }()
}