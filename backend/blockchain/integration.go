package blockchain

import (
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// BlockchainIntegration handles smart contract interactions
type BlockchainIntegration struct {
	client     *ethclient.Client
	privateKey *ecdsa.PrivateKey
	guardAddr  common.Address
	guardABI   abi.ABI
}

// RiskScoreUpdate represents a risk score update for the blockchain
type RiskScoreUpdate struct {
	ContractAddr common.Address
	RiskScore    *big.Int
	Timestamp    *big.Int
}

// NewBlockchainIntegration creates a new blockchain integration
func NewBlockchainIntegration() (*BlockchainIntegration, error) {
	// Connect to BlockDAG network
	rpcURL := os.Getenv("BLOCKCHAIN_RPC_URL")
	if rpcURL == "" {
		rpcURL = "https://rpc.primordial.bdagscan.com" // Default to BlockDAG Testnet
	}
	
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to blockchain: %w", err)
	}
	
	// Load private key for backend oracle
	privateKeyHex := os.Getenv("BACKEND_PRIVATE_KEY")
	if privateKeyHex == "" {
		log.Println("⚠️ No backend private key found, blockchain integration disabled")
		return &BlockchainIntegration{client: client}, nil
	}
	
	privateKey, err := crypto.HexToECDSA(strings.TrimPrefix(privateKeyHex, "0x"))
	if err != nil {
		return nil, fmt.Errorf("invalid private key: %w", err)
	}
	
	// Load TransactionGuard contract address
	guardAddrStr := os.Getenv("TRANSACTION_GUARD_ADDRESS")
	if guardAddrStr == "" {
		log.Println("⚠️ No TransactionGuard address found, using default")
		guardAddrStr = "0x0000000000000000000000000000000000000000"
	}
	
	guardAddr := common.HexToAddress(guardAddrStr)
	
	// Load contract ABI (simplified for demo)
	guardABI, err := abi.JSON(strings.NewReader(transactionGuardABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse contract ABI: %w", err)
	}
	
	log.Printf("✅ Blockchain integration initialized - Guard: %s", guardAddr.Hex())
	
	return &BlockchainIntegration{
		client:     client,
		privateKey: privateKey,
		guardAddr:  guardAddr,
		guardABI:   guardABI,
	}, nil
}

// UpdateRiskScore updates the risk score for a contract on-chain
func (b *BlockchainIntegration) UpdateRiskScore(contractAddr string, riskScore int) error {
	if b.privateKey == nil {
		return fmt.Errorf("blockchain integration not configured")
	}
	
	// Prepare transaction
	auth, err := bind.NewKeyedTransactorWithChainID(b.privateKey, big.NewInt(1043)) // BlockDAG Testnet chain ID
	if err != nil {
		return fmt.Errorf("failed to create transactor: %w", err)
	}
	
	// Set gas parameters
	auth.GasLimit = uint64(300000)
	auth.GasPrice = big.NewInt(20000000000) // 20 gwei
	
	// Prepare contract call parameters
	contractAddress := common.HexToAddress(contractAddr)
	riskScoreBig := big.NewInt(int64(riskScore))
	
	// Send transaction
	tx := &bind.TransactOpts{
		From:     auth.From,
		Signer:   auth.Signer,
		GasLimit: auth.GasLimit,
		GasPrice: auth.GasPrice,
	}
	
	boundContract := bind.NewBoundContract(b.guardAddr, b.guardABI, b.client, b.client, b.client)
	transaction, err := boundContract.Transact(tx, "updateRiskScore", contractAddress, riskScoreBig)
	if err != nil {
		return fmt.Errorf("failed to send transaction: %w", err)
	}
	
	log.Printf("📡 Risk score updated on-chain - TX: %s", transaction.Hash().Hex())
	return nil
}

// BatchUpdateRiskScores updates multiple risk scores in a single transaction
func (b *BlockchainIntegration) BatchUpdateRiskScores(updates []RiskScoreUpdate) error {
	if b.privateKey == nil {
		return fmt.Errorf("blockchain integration not configured")
	}
	
	if len(updates) == 0 {
		return nil
	}
	
	// Prepare arrays for batch update
	addresses := make([]common.Address, len(updates))
	scores := make([]*big.Int, len(updates))
	
	for i, update := range updates {
		addresses[i] = update.ContractAddr
		scores[i] = update.RiskScore
	}
	
	// Prepare transaction
	auth, err := bind.NewKeyedTransactorWithChainID(b.privateKey, big.NewInt(1043))
	if err != nil {
		return fmt.Errorf("failed to create transactor: %w", err)
	}
	
	auth.GasLimit = uint64(100000 + len(updates)*50000) // Dynamic gas based on batch size
	auth.GasPrice = big.NewInt(20000000000)
	
	// Send batch transaction
	boundContract := bind.NewBoundContract(b.guardAddr, b.guardABI, b.client, b.client, b.client)
	transaction, err := boundContract.Transact(auth, "batchUpdateRiskScores", addresses, scores)
	if err != nil {
		return fmt.Errorf("failed to send batch transaction: %w", err)
	}
	
	log.Printf("📡 Batch risk scores updated - TX: %s, Count: %d", transaction.Hash().Hex(), len(updates))
	return nil
}

// GetContractRiskScore retrieves the current risk score for a contract
func (b *BlockchainIntegration) GetContractRiskScore(contractAddr string) (int, error) {
	address := common.HexToAddress(contractAddr)
	
	// Call contract method
	boundContract := bind.NewBoundContract(b.guardAddr, b.guardABI, b.client, nil, nil)
	
	var result []interface{}
	err := boundContract.Call(&bind.CallOpts{}, &result, "riskScores", address)
	if err != nil {
		return 0, fmt.Errorf("failed to call contract: %w", err)
	}
	
	if len(result) == 0 {
		return 0, fmt.Errorf("no result from contract call")
	}
	
	riskScore, ok := result[0].(*big.Int)
	if !ok {
		return 0, fmt.Errorf("invalid result type")
	}
	
	return int(riskScore.Int64()), nil
}

// IsTransactionSafe checks if a transaction is safe according to the firewall
func (b *BlockchainIntegration) IsTransactionSafe(txHash string) (bool, error) {
	txHashBytes := common.HexToHash(txHash)
	
	boundContract := bind.NewBoundContract(b.guardAddr, b.guardABI, b.client, nil, nil)
	
	var result []interface{}
	err := boundContract.Call(&bind.CallOpts{}, &result, "isTransactionSafe", txHashBytes)
	if err != nil {
		return false, fmt.Errorf("failed to call contract: %w", err)
	}
	
	if len(result) == 0 {
		return false, fmt.Errorf("no result from contract call")
	}
	
	isSafe, ok := result[0].(bool)
	if !ok {
		return false, fmt.Errorf("invalid result type")
	}
	
	return isSafe, nil
}

// GetFirewallStats retrieves firewall statistics from the contract
func (b *BlockchainIntegration) GetFirewallStats() (map[string]interface{}, error) {
	boundContract := bind.NewBoundContract(b.guardAddr, b.guardABI, b.client, nil, nil)
	
	var result []interface{}
	err := boundContract.Call(&bind.CallOpts{}, &result, "getFirewallStats")
	if err != nil {
		return nil, fmt.Errorf("failed to call contract: %w", err)
	}
	
	if len(result) < 5 {
		return nil, fmt.Errorf("insufficient result data")
	}
	
	stats := map[string]interface{}{
		"transactionsScreened": result[0].(*big.Int).Int64(),
		"exploitsBlocked":      result[1].(*big.Int).Int64(),
		"fundsProtected":       result[2].(*big.Int).Int64(),
		"activeValidators":     result[3].(*big.Int).Int64(),
		"totalStaked":          result[4].(*big.Int).Int64(),
	}
	
	return stats, nil
}

// Simplified TransactionGuard ABI for essential functions
const transactionGuardABI = `[
	{
		"inputs": [
			{"name": "contractAddr", "type": "address"},
			{"name": "score", "type": "uint256"}
		],
		"name": "updateRiskScore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{"name": "contracts", "type": "address[]"},
			{"name": "scores", "type": "uint256[]"}
		],
		"name": "batchUpdateRiskScores",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{"name": "", "type": "address"}],
		"name": "riskScores",
		"outputs": [{"name": "", "type": "uint256"}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{"name": "txHash", "type": "bytes32"}],
		"name": "isTransactionSafe",
		"outputs": [{"name": "", "type": "bool"}],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getFirewallStats",
		"outputs": [
			{"name": "transactionsScreened", "type": "uint256"},
			{"name": "exploitsBlocked", "type": "uint256"},
			{"name": "fundsProtected", "type": "uint256"},
			{"name": "activeValidatorCount", "type": "uint256"},
			{"name": "totalStakedAmount", "type": "uint256"}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`