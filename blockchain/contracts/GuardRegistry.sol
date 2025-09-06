// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TransactionGuard.sol";

/**
 * @title GuardRegistry
 * @dev Central registry for DeFi protocols to register for Transaction Guard protection
 * 
 * BLOCKDAG INTEGRATION BENEFITS:
 * - Parallel registration processing for multiple protocols simultaneously
 * - Low latency updates enable real-time protection activation
 * - High throughput supports ecosystem-wide adoption
 * - Cross-chain compatibility via BlockDAG bridge integration
 */
contract GuardRegistry is Ownable, ReentrancyGuard {
    
    // Protocol registration structure
    struct ProtocolInfo {
        address protocolAddress;
        address owner;
        string name;
        string category; // "DEX", "Lending", "Yield", etc.
        uint256 registrationTime;
        bool isActive;
        uint256 protectedVolume; // Total volume protected
        uint256 threatsBlocked; // Number of threats blocked
    }
    
    // Guard instance for protection
    TransactionGuard public immutable transactionGuard;
    
    // Registry mappings
    mapping(address => ProtocolInfo) public registeredProtocols;
    mapping(string => address) public protocolsByName;
    address[] public allProtocols;
    
    // Category tracking
    mapping(string => address[]) public protocolsByCategory;
    string[] public supportedCategories;
    
    // Statistics
    uint256 public totalProtectedVolume;
    uint256 public totalThreatsBlocked;
    uint256 public activeProtocolCount;
    
    // Events
    event ProtocolRegistered(
        address indexed protocol,
        address indexed owner,
        string name,
        string category
    );
    event ProtocolDeactivated(address indexed protocol, string reason);
    event ProtocolReactivated(address indexed protocol);
    event ThreatBlocked(address indexed protocol, string threatType, uint256 amount);
    event VolumeProtected(address indexed protocol, uint256 amount);
    
    constructor(address _transactionGuard) {
        require(_transactionGuard != address(0), "Invalid TransactionGuard address");
        transactionGuard = TransactionGuard(_transactionGuard);
        
        // Initialize supported categories
        supportedCategories.push("DEX");
        supportedCategories.push("Lending");
        supportedCategories.push("Yield");
        supportedCategories.push("Derivatives");
        supportedCategories.push("Insurance");
        supportedCategories.push("Bridge");
    }
    
    /**
     * @dev Register a DeFi protocol for Transaction Guard protection
     * BLOCKDAG ADVANTAGE: Parallel processing allows multiple protocols to register
     * simultaneously without network congestion
     */
    function registerProtocol(
        address protocolAddress,
        string calldata name,
        string calldata category
    ) external nonReentrant {
        require(protocolAddress != address(0), "Invalid protocol address");
        require(bytes(name).length > 0, "Protocol name required");
        require(_isSupportedCategory(category), "Unsupported category");
        require(registeredProtocols[protocolAddress].registrationTime == 0, "Protocol already registered");
        require(protocolsByName[name] == address(0), "Name already taken");
        
        // Create protocol info
        ProtocolInfo storage protocol = registeredProtocols[protocolAddress];
        protocol.protocolAddress = protocolAddress;
        protocol.owner = msg.sender;
        protocol.name = name;
        protocol.category = category;
        protocol.registrationTime = block.timestamp;
        protocol.isActive = true;
        
        // Update mappings
        protocolsByName[name] = protocolAddress;
        allProtocols.push(protocolAddress);
        protocolsByCategory[category].push(protocolAddress);
        activeProtocolCount++;
        
        emit ProtocolRegistered(protocolAddress, msg.sender, name, category);
    }
    
    /**
     * @dev Deactivate a protocol (only by owner or admin)
     */
    function deactivateProtocol(address protocolAddress, string calldata reason) external {
        ProtocolInfo storage protocol = registeredProtocols[protocolAddress];
        require(protocol.registrationTime != 0, "Protocol not registered");
        require(
            msg.sender == protocol.owner || msg.sender == owner(),
            "Not authorized"
        );
        require(protocol.isActive, "Protocol already inactive");
        
        protocol.isActive = false;
        activeProtocolCount--;
        
        emit ProtocolDeactivated(protocolAddress, reason);
    }
    
    /**
     * @dev Reactivate a protocol (only by owner or admin)
     */
    function reactivateProtocol(address protocolAddress) external {
        ProtocolInfo storage protocol = registeredProtocols[protocolAddress];
        require(protocol.registrationTime != 0, "Protocol not registered");
        require(
            msg.sender == protocol.owner || msg.sender == owner(),
            "Not authorized"
        );
        require(!protocol.isActive, "Protocol already active");
        
        protocol.isActive = true;
        activeProtocolCount++;
        
        emit ProtocolReactivated(protocolAddress);
    }
    
    /**
     * @dev Record a threat that was blocked for a protocol
     * Called by TransactionGuard when threats are detected
     */
    function recordThreatBlocked(
        address protocolAddress,
        string calldata threatType,
        uint256 amount
    ) external {
        require(msg.sender == address(transactionGuard), "Only TransactionGuard can record threats");
        
        ProtocolInfo storage protocol = registeredProtocols[protocolAddress];
        if (protocol.registrationTime != 0 && protocol.isActive) {
            protocol.threatsBlocked++;
            totalThreatsBlocked++;
            
            emit ThreatBlocked(protocolAddress, threatType, amount);
        }
    }
    
    /**
     * @dev Record protected volume for a protocol
     */
    function recordProtectedVolume(address protocolAddress, uint256 amount) external {
        require(msg.sender == address(transactionGuard), "Only TransactionGuard can record volume");
        
        ProtocolInfo storage protocol = registeredProtocols[protocolAddress];
        if (protocol.registrationTime != 0 && protocol.isActive) {
            protocol.protectedVolume += amount;
            totalProtectedVolume += amount;
            
            emit VolumeProtected(protocolAddress, amount);
        }
    }
    
    /**
     * @dev Check if a protocol is registered and active
     */
    function isProtocolActive(address protocolAddress) external view returns (bool) {
        ProtocolInfo memory protocol = registeredProtocols[protocolAddress];
        return protocol.registrationTime != 0 && protocol.isActive;
    }
    
    /**
     * @dev Get protocol information
     */
    function getProtocolInfo(address protocolAddress) external view returns (
        string memory name,
        string memory category,
        address owner,
        uint256 registrationTime,
        bool isActive,
        uint256 protectedVolume,
        uint256 threatsBlocked
    ) {
        ProtocolInfo memory protocol = registeredProtocols[protocolAddress];
        return (
            protocol.name,
            protocol.category,
            protocol.owner,
            protocol.registrationTime,
            protocol.isActive,
            protocol.protectedVolume,
            protocol.threatsBlocked
        );
    }
    
    /**
     * @dev Get protocols by category
     */
    function getProtocolsByCategory(string calldata category) external view returns (address[] memory) {
        return protocolsByCategory[category];
    }
    
    /**
     * @dev Get all registered protocols
     */
    function getAllProtocols() external view returns (address[] memory) {
        return allProtocols;
    }
    
    /**
     * @dev Get registry statistics
     */
    function getRegistryStats() external view returns (
        uint256 totalProtocols,
        uint256 activeProtocols,
        uint256 totalVolume,
        uint256 totalThreats,
        uint256 categoriesSupported
    ) {
        return (
            allProtocols.length,
            activeProtocolCount,
            totalProtectedVolume,
            totalThreatsBlocked,
            supportedCategories.length
        );
    }
    
    /**
     * @dev Get supported categories
     */
    function getSupportedCategories() external view returns (string[] memory) {
        return supportedCategories;
    }
    
    /**
     * @dev Add a new supported category (admin only)
     */
    function addSupportedCategory(string calldata category) external onlyOwner {
        require(bytes(category).length > 0, "Invalid category");
        supportedCategories.push(category);
    }
    
    /**
     * @dev Internal function to check if category is supported
     */
    function _isSupportedCategory(string calldata category) internal view returns (bool) {
        for (uint256 i = 0; i < supportedCategories.length; i++) {
            if (keccak256(bytes(supportedCategories[i])) == keccak256(bytes(category))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Emergency function to update TransactionGuard integration
     * Allows for upgrades while maintaining registry data
     */
    function emergencyMigration(address newGuard) external onlyOwner {
        // In a real implementation, this would handle migration logic
        // For now, just emit an event for tracking
        emit ProtocolDeactivated(address(0), "Emergency migration initiated");
    }
}