// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockBDAG
 * @dev Mock BDAG token for testing Transaction Guard
 */
contract MockBDAG is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1B tokens
    
    constructor() ERC20("BlockDAG", "BDAG") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint tokens for testing
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function for demo
     */
    function faucet(address to, uint256 amount) external {
        require(amount <= 10000 * 10**18, "Max 10K tokens per request");
        _mint(to, amount);
    }
}