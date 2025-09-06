// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TransactionGuard
 * @dev Real-time DeFi exploit firewall with BDAG staking and AI risk scoring
 */
contract TransactionGuard is ReentrancyGuard, Ownable {
    IERC20 public immutable bdagToken;
    
    // Risk scoring thresholds
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant BLOCK_THRESHOLD = 80; // Block if risk > 80%
    uint256 public constant MIN_VALIDATOR_STAKE = 1000 * 10**18; // 1000 BDAG
    
    // Validator staking
    struct Validator {
        uint256 stakedAmount;
        uint256 correctPredictions;
        uint256 totalPredictions;
        bool isActive;
        uint256 lastActivity;
    }
    
    // Transaction risk assessment
    struct RiskAssessment {
        uint256 riskScore;
        string threatType;
        address validator;
        uint256 timestamp;
        bool isBlocked;
    }
    
    mapping(address => Validator) public validators;
    mapping(bytes32 => RiskAssessment) public assessments;
    mapping(address => bool) public trustedContracts;
    
    address[] public activeValidators;
    uint256 public totalStaked;
    uint256 public totalTransactionsScreened;
    uint256 public totalExploitsBlocked;
    uint256 public totalFundsProtected;
    
    // Events
    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorSlashed(address indexed validator, uint256 amount, string reason);
    event TransactionBlocked(bytes32 indexed txHash, uint256 riskScore, string threatType);
    event TransactionApproved(bytes32 indexed txHash, uint256 riskScore);
    event ExploitPrevented(address indexed target, uint256 potentialLoss);
    
    constructor(address _bdagToken) {
        bdagToken = IERC20(_bdagToken);
    }
    
    /**
     * @dev Modifier to protect functions from malicious transactions
     */
    modifier protected() {
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, msg.data, block.timestamp));
        require(isTransactionSafe(txHash), "TransactionGuard: Transaction blocked by firewall");
        totalTransactionsScreened++;
        _;
    }
    
    /**
     * @dev Stake BDAG tokens to become a validator
     */
    function stakeAsValidator(uint256 amount) external nonReentrant {
        require(amount >= MIN_VALIDATOR_STAKE, "Insufficient stake amount");
        require(bdagToken.transferFrom(msg.sender, address(this), amount), "Stake transfer failed");
        
        Validator storage validator = validators[msg.sender];
        if (!validator.isActive) {
            activeValidators.push(msg.sender);
            validator.isActive = true;
        }
        
        validator.stakedAmount += amount;
        validator.lastActivity = block.timestamp;
        totalStaked += amount;
        
        emit ValidatorStaked(msg.sender, amount);
    }
    
    /**
     * @dev Submit risk assessment for a transaction
     */
    function submitRiskAssessment(
        bytes32 txHash,
        uint256 riskScore,
        string calldata threatType
    ) external {
        require(validators[msg.sender].isActive, "Not an active validator");
        require(riskScore <= MAX_RISK_SCORE, "Invalid risk score");
        
        validators[msg.sender].totalPredictions++;
        validators[msg.sender].lastActivity = block.timestamp;
        
        bool shouldBlock = riskScore > BLOCK_THRESHOLD;
        
        assessments[txHash] = RiskAssessment({
            riskScore: riskScore,
            threatType: threatType,
            validator: msg.sender,
            timestamp: block.timestamp,
            isBlocked: shouldBlock
        });
        
        if (shouldBlock) {
            totalExploitsBlocked++;
            emit TransactionBlocked(txHash, riskScore, threatType);
        } else {
            emit TransactionApproved(txHash, riskScore);
        }
    }
    
    /**
     * @dev Check if transaction is safe to execute
     */
    function isTransactionSafe(bytes32 txHash) public view returns (bool) {
        RiskAssessment memory assessment = assessments[txHash];
        
        // If no assessment exists, allow (for demo - in production, require assessment)
        if (assessment.timestamp == 0) {
            return true;
        }
        
        // Block if risk score is too high
        return !assessment.isBlocked;
    }
    
    /**
     * @dev Execute protected transaction (for demo purposes)
     */
    function executeProtectedTransaction(
        address target,
        bytes calldata data,
        uint256 value
    ) external payable protected returns (bool success) {
        require(target != address(0), "Invalid target");
        
        // Execute the transaction
        (success, ) = target.call{value: value}(data);
        
        if (success) {
            emit TransactionApproved(
                keccak256(abi.encodePacked(msg.sender, data, block.timestamp)),
                0 // Safe transaction
            );
        }
    }
    
    /**
     * @dev Simulate exploit prevention (for demo)
     */
    function simulateExploitPrevention(
        address target,
        uint256 potentialLoss,
        string calldata exploitType
    ) external onlyOwner {
        totalFundsProtected += potentialLoss;
        emit ExploitPrevented(target, potentialLoss);
    }
    
    /**
     * @dev Slash validator for incorrect predictions
     */
    function slashValidator(address validator, uint256 slashAmount, string calldata reason) 
        external onlyOwner {
        require(validators[validator].isActive, "Validator not active");
        require(validators[validator].stakedAmount >= slashAmount, "Insufficient stake");
        
        validators[validator].stakedAmount -= slashAmount;
        totalStaked -= slashAmount;
        
        // Transfer slashed tokens to treasury (owner)
        require(bdagToken.transfer(owner(), slashAmount), "Slash transfer failed");
        
        emit ValidatorSlashed(validator, slashAmount, reason);
    }
    
    /**
     * @dev Add trusted contract (bypass firewall)
     */
    function addTrustedContract(address contractAddr) external onlyOwner {
        trustedContracts[contractAddr] = true;
    }
    
    /**
     * @dev Get validator info
     */
    function getValidatorInfo(address validator) external view returns (
        uint256 stakedAmount,
        uint256 correctPredictions,
        uint256 totalPredictions,
        bool isActive,
        uint256 accuracy
    ) {
        Validator memory v = validators[validator];
        accuracy = v.totalPredictions > 0 ? (v.correctPredictions * 100) / v.totalPredictions : 0;
        
        return (
            v.stakedAmount,
            v.correctPredictions,
            v.totalPredictions,
            v.isActive,
            accuracy
        );
    }
    
    /**
     * @dev Get firewall statistics
     */
    function getFirewallStats() external view returns (
        uint256 transactionsScreened,
        uint256 exploitsBlocked,
        uint256 fundsProtected,
        uint256 activeValidatorCount,
        uint256 totalStakedAmount
    ) {
        return (
            totalTransactionsScreened,
            totalExploitsBlocked,
            totalFundsProtected,
            activeValidators.length,
            totalStaked
        );
    }
    
    /**
     * @dev Emergency pause (circuit breaker)
     */
    function emergencyPause() external onlyOwner {
        // In a real implementation, this would pause all protected functions
        // For demo, we'll just emit an event
        emit TransactionBlocked(bytes32(0), 100, "Emergency Pause Activated");
    }
}