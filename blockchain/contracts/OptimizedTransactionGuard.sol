// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title OptimizedTransactionGuard
 * @dev Gas-optimized version of TransactionGuard with reduced gas costs
 * 
 * GAS OPTIMIZATION TECHNIQUES:
 * - Packed structs to reduce storage slots
 * - Custom errors instead of require strings
 * - Batch operations for multiple updates
 * - Optimized storage layout
 * - Reduced external calls
 */
contract OptimizedTransactionGuard is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable bdagToken;
    
    // Packed structs to save gas
    struct Validator {
        uint128 stakedAmount;    // Reduced from uint256
        uint64 correctPredictions; // Reduced from uint256
        uint64 totalPredictions;   // Reduced from uint256
        uint32 lastActivity;       // Reduced from uint256
        bool isActive;
    }
    
    struct RiskAssessment {
        uint32 riskScore;         // Reduced from uint256
        uint32 timestamp;         // Reduced from uint256
        address validator;
        bool isBlocked;
        // threatType removed to save gas - use enum instead
    }
    
    // Use enum instead of string for threat types (saves gas)
    enum ThreatType {
        NORMAL,
        FLASH_LOAN,
        RUG_PULL,
        GOVERNANCE_EXPLOIT,
        LIQUIDITY_DRAIN,
        SANDWICH_ATTACK,
        MEV_BOT
    }
    
    // Constants for gas optimization
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant BLOCK_THRESHOLD = 80;
    uint256 public constant MIN_VALIDATOR_STAKE = 1000 * 10**18;
    uint256 public constant RISK_SCORE_VALIDITY = 300; // 5 minutes
    
    // Packed storage for gas efficiency
    mapping(address => Validator) public validators;
    mapping(bytes32 => RiskAssessment) public assessments;
    mapping(address => bool) public trustedContracts;
    mapping(address => uint32) public riskScores; // Reduced from uint256
    mapping(address => uint32) public lastRiskUpdate; // Reduced from uint256
    
    // Packed arrays for gas efficiency
    address[] public activeValidators;
    
    // Packed stats
    uint64 public totalTransactionsScreened;
    uint64 public totalExploitsBlocked;
    uint128 public totalStaked;
    uint128 public totalFundsProtected;
    
    // Backend oracle
    address public backendOracle;
    
    // Custom errors for gas efficiency
    error InsufficientStake();
    error InvalidRiskScore();
    error NotActiveValidator();
    error TransactionBlockedError();
    error InvalidTarget();
    error UnauthorizedOracle();
    error InvalidArrayLength();
    
    // Events with indexed parameters for gas efficiency
    event ValidatorStaked(address indexed validator, uint128 amount);
    event ValidatorSlashed(address indexed validator, uint128 amount, uint8 reason);
    event TransactionBlocked(bytes32 indexed txHash, uint32 riskScore, uint8 threatType);
    event TransactionApproved(bytes32 indexed txHash, uint32 riskScore);
    event ExploitPrevented(address indexed target, uint128 potentialLoss);
    event RiskScoreUpdated(address indexed contractAddr, uint32 newScore, address indexed updatedBy);
    event BackendOracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    constructor(address _bdagToken, address _backendOracle) {
        bdagToken = IERC20(_bdagToken);
        backendOracle = _backendOracle;
    }
    
    /**
     * @dev Gas-optimized protected modifier
     * Uses custom errors and packed operations
     */
    modifier protected() {
        if (paused()) revert TransactionBlockedError();
        
        // Optimized hash generation
        bytes32 txHash = keccak256(abi.encodePacked(
            msg.sender, 
            msg.data, 
            block.timestamp,
            block.number
        ));
        
        if (!isTransactionSafe(txHash)) revert TransactionBlockedError();
        
        // Unchecked increment for gas efficiency
        unchecked {
            ++totalTransactionsScreened;
        }
        _;
    }
    
    /**
     * @dev Gas-optimized stake function
     */
    function stakeAsValidator(uint128 amount) external nonReentrant {
        if (amount < MIN_VALIDATOR_STAKE) revert InsufficientStake();
        if (!bdagToken.transferFrom(msg.sender, address(this), amount)) revert InsufficientStake();
        
        Validator storage validator = validators[msg.sender];
        if (!validator.isActive) {
            activeValidators.push(msg.sender);
            validator.isActive = true;
        }
        
        // Unchecked arithmetic for gas efficiency
        unchecked {
            validator.stakedAmount += amount;
            validator.lastActivity = uint32(block.timestamp);
            totalStaked += amount;
        }
        
        emit ValidatorStaked(msg.sender, amount);
    }
    
    /**
     * @dev Gas-optimized risk assessment submission
     */
    function submitRiskAssessment(
        bytes32 txHash,
        uint32 riskScore,
        uint8 threatType
    ) external {
        Validator storage validator = validators[msg.sender];
        if (!validator.isActive) revert NotActiveValidator();
        if (riskScore > MAX_RISK_SCORE) revert InvalidRiskScore();
        
        // Unchecked arithmetic
        unchecked {
            ++validator.totalPredictions;
            validator.lastActivity = uint32(block.timestamp);
        }
        
        bool shouldBlock = riskScore > BLOCK_THRESHOLD;
        
        assessments[txHash] = RiskAssessment({
            riskScore: riskScore,
            validator: msg.sender,
            timestamp: uint32(block.timestamp),
            isBlocked: shouldBlock
        });
        
        if (shouldBlock) {
            unchecked {
                ++totalExploitsBlocked;
            }
            emit TransactionBlocked(txHash, riskScore, threatType);
        } else {
            emit TransactionApproved(txHash, riskScore);
        }
    }
    
    /**
     * @dev Gas-optimized transaction safety check
     */
    function isTransactionSafe(bytes32 txHash) public view returns (bool) {
        RiskAssessment memory assessment = assessments[txHash];
        
        if (assessment.timestamp != 0) {
            return !assessment.isBlocked;
        }
        
        return true; // Allow by default for demo
    }
    
    /**
     * @dev Gas-optimized contract safety check
     */
    function _isContractSafe(address contractAddr) internal view returns (bool) {
        uint32 riskScore = riskScores[contractAddr];
        uint32 lastUpdate = lastRiskUpdate[contractAddr];
        
        if (block.timestamp - lastUpdate > RISK_SCORE_VALIDITY) {
            return true;
        }
        
        return riskScore <= BLOCK_THRESHOLD;
    }
    
    /**
     * @dev Gas-optimized protected execution
     */
    function executeProtected(
        address target,
        bytes calldata data
    ) external payable protected returns (bool success, bytes memory returnData) {
        if (target == address(0)) revert InvalidTarget();
        if (trustedContracts[target] && !_isContractSafe(target)) revert TransactionBlockedError();
        
        (success, returnData) = target.call{value: msg.value}(data);
        
        if (success) {
            bytes32 txHash = keccak256(abi.encodePacked(msg.sender, data, block.timestamp));
            emit TransactionApproved(txHash, _getEffectiveRiskScore(target));
        }
        
        return (success, returnData);
    }
    
    /**
     * @dev Gas-optimized risk score update
     */
    function updateRiskScore(address contractAddr, uint32 score) external {
        if (msg.sender != backendOracle) revert UnauthorizedOracle();
        if (score > MAX_RISK_SCORE) revert InvalidRiskScore();
        
        riskScores[contractAddr] = score;
        lastRiskUpdate[contractAddr] = uint32(block.timestamp);
        
        emit RiskScoreUpdated(contractAddr, score, msg.sender);
    }
    
    /**
     * @dev Gas-optimized batch risk score update
     */
    function batchUpdateRiskScores(
        address[] calldata contracts,
        uint32[] calldata scores
    ) external {
        if (msg.sender != backendOracle) revert UnauthorizedOracle();
        if (contracts.length != scores.length) revert InvalidArrayLength();
        
        uint32 timestamp = uint32(block.timestamp);
        
        for (uint256 i = 0; i < contracts.length; ) {
            if (scores[i] > MAX_RISK_SCORE) revert InvalidRiskScore();
            riskScores[contracts[i]] = scores[i];
            lastRiskUpdate[contracts[i]] = timestamp;
            emit RiskScoreUpdated(contracts[i], scores[i], msg.sender);
            
            // Unchecked increment for gas efficiency
            unchecked {
                ++i;
            }
        }
    }
    
    /**
     * @dev Gas-optimized validator slashing
     */
    function slashValidator(address validator, uint128 slashAmount, uint8 reason) 
        external onlyOwner {
        Validator storage v = validators[validator];
        if (!v.isActive) revert NotActiveValidator();
        if (v.stakedAmount < slashAmount) revert InsufficientStake();
        
        // Unchecked arithmetic
        unchecked {
            v.stakedAmount -= slashAmount;
            totalStaked -= slashAmount;
        }
        
        if (!bdagToken.transfer(owner(), slashAmount)) revert InsufficientStake();
        
        emit ValidatorSlashed(validator, slashAmount, reason);
    }
    
    /**
     * @dev Gas-optimized getter functions
     */
    function getValidatorInfo(address validator) external view returns (
        uint128 stakedAmount,
        uint64 correctPredictions,
        uint64 totalPredictions,
        bool isActive,
        uint64 accuracy
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
    
    function getFirewallStats() external view returns (
        uint64 transactionsScreened,
        uint64 exploitsBlocked,
        uint128 fundsProtected,
        uint64 activeValidatorCount,
        uint128 totalStakedAmount
    ) {
        return (
            totalTransactionsScreened,
            totalExploitsBlocked,
            totalFundsProtected,
            uint64(activeValidators.length),
            totalStaked
        );
    }
    
    function _getEffectiveRiskScore(address contractAddr) internal view returns (uint32) {
        uint32 lastUpdate = lastRiskUpdate[contractAddr];
        
        if (block.timestamp - lastUpdate > RISK_SCORE_VALIDITY) {
            return 50; // Medium risk for stale data
        }
        
        return riskScores[contractAddr];
    }
    
    // Admin functions
    function setBackendOracle(address newOracle) external onlyOwner {
        if (newOracle == address(0)) revert InvalidTarget();
        address oldOracle = backendOracle;
        backendOracle = newOracle;
        emit BackendOracleUpdated(oldOracle, newOracle);
    }
    
    function addTrustedContract(address contractAddr) external onlyOwner {
        trustedContracts[contractAddr] = true;
    }
    
    function removeTrustedContract(address contractAddr) external onlyOwner {
        trustedContracts[contractAddr] = false;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyPause() external onlyOwner {
        _pause();
        emit TransactionBlocked(bytes32(0), 100, uint8(ThreatType.MEV_BOT));
    }
}
