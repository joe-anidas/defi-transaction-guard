// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestTokenA
 * @dev Test token for DEX demo
 */
contract TestTokenA is ERC20 {
    constructor() ERC20("Test Token A", "TTA") {
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens
    }
    
    function faucet(address to, uint256 amount) external {
        require(amount <= 1000 * 10**18, "Max 1K tokens per request");
        _mint(to, amount);
    }
}

/**
 * @title TestTokenB
 * @dev Test token for DEX demo
 */
contract TestTokenB is ERC20 {
    constructor() ERC20("Test Token B", "TTB") {
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens
    }
    
    function faucet(address to, uint256 amount) external {
        require(amount <= 1000 * 10**18, "Max 1K tokens per request");
        _mint(to, amount);
    }
}

/**
 * @title MaliciousContract
 * @dev Contract that simulates malicious behavior for demo
 */
contract MaliciousContract {
    event ExploitAttempted(address victim, uint256 amount);
    
    /**
     * @dev Simulate a liquidity drain attack
     */
    function drainLiquidity(address target, uint256 amount) external {
        // This would normally drain funds, but for demo we just emit event
        emit ExploitAttempted(target, amount);
        
        // Simulate suspicious behavior that AI would detect:
        // - High gas usage
        // - Multiple external calls
        // - Unusual patterns
        
        // In a real attack, this might:
        // 1. Flash loan large amount
        // 2. Manipulate price oracle
        // 3. Drain liquidity pools
        // 4. Repay flash loan with profit
        
        revert("Malicious transaction blocked by Transaction Guard");
    }
    
    /**
     * @dev Simulate rug pull
     */
    function rugPull() external {
        emit ExploitAttempted(msg.sender, address(this).balance);
        revert("Rug pull blocked by Transaction Guard");
    }
    
    /**
     * @dev Simulate sandwich attack
     */
    function sandwichAttack(address victim, uint256 frontrunAmount) external {
        emit ExploitAttempted(victim, frontrunAmount);
        revert("Sandwich attack blocked by Transaction Guard");
    }
}