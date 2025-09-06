// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./TransactionGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ProtectedDEX
 * @dev Sample DEX with integrated Transaction Guard protection
 */
contract ProtectedDEX is ReentrancyGuard {
    TransactionGuard public immutable transactionGuard;
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidity;
    }
    
    mapping(bytes32 => Pool) public pools;
    bytes32[] public poolIds;
    
    uint256 public constant FEE_RATE = 3; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    event LiquidityAdded(bytes32 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(bytes32 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB);
    event Swap(bytes32 indexed poolId, address indexed trader, address tokenIn, uint256 amountIn, uint256 amountOut);
    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB);
    
    modifier onlyProtected() {
        // Use Transaction Guard's protected modifier
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, msg.data, block.timestamp));
        require(transactionGuard.isTransactionSafe(txHash), "ProtectedDEX: Transaction blocked by firewall");
        _;
    }
    
    constructor(address _transactionGuard) {
        transactionGuard = TransactionGuard(_transactionGuard);
    }
    
    /**
     * @dev Create a new liquidity pool (PROTECTED)
     */
    function createPool(address tokenA, address tokenB) external onlyProtected returns (bytes32 poolId) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        
        // Order tokens to ensure consistent pool IDs
        if (tokenA > tokenB) {
            (tokenA, tokenB) = (tokenB, tokenA);
        }
        
        poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        require(pools[poolId].tokenA == address(0), "Pool already exists");
        
        Pool storage pool = pools[poolId];
        pool.tokenA = tokenA;
        pool.tokenB = tokenB;
        
        poolIds.push(poolId);
        
        emit PoolCreated(poolId, tokenA, tokenB);
    }
    
    /**
     * @dev Add liquidity to pool (PROTECTED)
     */
    function addLiquidity(
        bytes32 poolId,
        uint256 amountA,
        uint256 amountB,
        uint256 minAmountA,
        uint256 minAmountB
    ) external onlyProtected nonReentrant {
        Pool storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool does not exist");
        
        uint256 actualAmountA = amountA;
        uint256 actualAmountB = amountB;
        
        // Calculate optimal amounts if pool has existing liquidity
        if (pool.reserveA > 0 && pool.reserveB > 0) {
            uint256 optimalAmountB = (amountA * pool.reserveB) / pool.reserveA;
            if (optimalAmountB <= amountB) {
                actualAmountB = optimalAmountB;
            } else {
                actualAmountA = (amountB * pool.reserveA) / pool.reserveB;
            }
        }
        
        require(actualAmountA >= minAmountA, "Insufficient amount A");
        require(actualAmountB >= minAmountB, "Insufficient amount B");
        
        // Transfer tokens
        require(IERC20(pool.tokenA).transferFrom(msg.sender, address(this), actualAmountA), "Transfer A failed");
        require(IERC20(pool.tokenB).transferFrom(msg.sender, address(this), actualAmountB), "Transfer B failed");
        
        // Calculate liquidity tokens to mint
        uint256 liquidityMinted;
        if (pool.totalLiquidity == 0) {
            liquidityMinted = sqrt(actualAmountA * actualAmountB);
        } else {
            liquidityMinted = min(
                (actualAmountA * pool.totalLiquidity) / pool.reserveA,
                (actualAmountB * pool.totalLiquidity) / pool.reserveB
            );
        }
        
        // Update pool state
        pool.reserveA += actualAmountA;
        pool.reserveB += actualAmountB;
        pool.totalLiquidity += liquidityMinted;
        pool.liquidity[msg.sender] += liquidityMinted;
        
        emit LiquidityAdded(poolId, msg.sender, actualAmountA, actualAmountB);
    }
    
    /**
     * @dev Swap tokens (PROTECTED - this is where exploits typically happen)
     */
    function swap(
        bytes32 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external onlyProtected nonReentrant {
        Pool storage pool = pools[poolId];
        require(pool.tokenA != address(0), "Pool does not exist");
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");
        require(amountIn > 0, "Invalid amount");
        
        // Determine input/output tokens and reserves
        (address tokenOut, uint256 reserveIn, uint256 reserveOut) = 
            tokenIn == pool.tokenA ? 
            (pool.tokenB, pool.reserveA, pool.reserveB) : 
            (pool.tokenA, pool.reserveB, pool.reserveA);
        
        // Calculate output amount with fee
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
        
        require(amountOut >= minAmountOut, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        // Transfer tokens
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Transfer in failed");
        require(IERC20(tokenOut).transfer(msg.sender, amountOut), "Transfer out failed");
        
        // Update reserves
        if (tokenIn == pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        emit Swap(poolId, msg.sender, tokenIn, amountIn, amountOut);
    }
    
    /**
     * @dev Remove liquidity (PROTECTED)
     */
    function removeLiquidity(
        bytes32 poolId,
        uint256 liquidityAmount,
        uint256 minAmountA,
        uint256 minAmountB
    ) external onlyProtected nonReentrant {
        Pool storage pool = pools[poolId];
        require(pool.liquidity[msg.sender] >= liquidityAmount, "Insufficient liquidity");
        
        uint256 amountA = (liquidityAmount * pool.reserveA) / pool.totalLiquidity;
        uint256 amountB = (liquidityAmount * pool.reserveB) / pool.totalLiquidity;
        
        require(amountA >= minAmountA, "Insufficient amount A");
        require(amountB >= minAmountB, "Insufficient amount B");
        
        // Update state
        pool.liquidity[msg.sender] -= liquidityAmount;
        pool.totalLiquidity -= liquidityAmount;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        
        // Transfer tokens
        require(IERC20(pool.tokenA).transfer(msg.sender, amountA), "Transfer A failed");
        require(IERC20(pool.tokenB).transfer(msg.sender, amountB), "Transfer B failed");
        
        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB);
    }
    
    /**
     * @dev Get pool information
     */
    function getPoolInfo(bytes32 poolId) external view returns (
        address tokenA,
        address tokenB,
        uint256 reserveA,
        uint256 reserveB,
        uint256 totalLiquidity
    ) {
        Pool storage pool = pools[poolId];
        return (pool.tokenA, pool.tokenB, pool.reserveA, pool.reserveB, pool.totalLiquidity);
    }
    
    /**
     * @dev Get user liquidity
     */
    function getUserLiquidity(bytes32 poolId, address user) external view returns (uint256) {
        return pools[poolId].liquidity[user];
    }
    
    /**
     * @dev Calculate swap output (for frontend)
     */
    function getAmountOut(bytes32 poolId, address tokenIn, uint256 amountIn) 
        external view returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");
        
        uint256 reserveIn = tokenIn == pool.tokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = tokenIn == pool.tokenA ? pool.reserveB : pool.reserveA;
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
    }
    
    // Utility functions
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}