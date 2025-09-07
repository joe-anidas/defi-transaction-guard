// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./OptimizedTransactionGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OptimizedProtectedDEX
 * @dev Gas-optimized DEX with integrated Transaction Guard protection
 * 
 * GAS OPTIMIZATION TECHNIQUES:
 * - Packed structs for storage efficiency
 * - Custom errors instead of require strings
 * - Batch operations for multiple updates
 * - Optimized storage layout
 * - Reduced external calls
 */
contract OptimizedProtectedDEX is ReentrancyGuard {
    OptimizedTransactionGuard public immutable transactionGuard;
    
    // Packed struct for gas efficiency
    struct Pool {
        address tokenA;
        address tokenB;
        uint128 reserveA;    // Reduced from uint256
        uint128 reserveB;    // Reduced from uint256
        uint128 totalLiquidity; // Reduced from uint256
        mapping(address => uint128) liquidity; // Reduced from uint256
    }
    
    mapping(bytes32 => Pool) public pools;
    bytes32[] public poolIds;
    
    // Constants for gas efficiency
    uint256 public constant FEE_RATE = 3; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    // Packed stats
    uint64 public totalPools;
    uint64 public totalSwaps;
    uint128 public totalVolume;
    uint128 public totalFees;
    
    // Custom errors for gas efficiency
    error PoolDoesNotExist();
    error InvalidToken();
    error InvalidAmount();
    error InsufficientAmount();
    error InsufficientLiquidity();
    error TransferFailed();
    error TransactionBlocked();
    
    // Events with indexed parameters for gas efficiency
    event LiquidityAdded(bytes32 indexed poolId, address indexed provider, uint128 amountA, uint128 amountB);
    event LiquidityRemoved(bytes32 indexed poolId, address indexed provider, uint128 amountA, uint128 amountB);
    event Swap(bytes32 indexed poolId, address indexed trader, address tokenIn, uint128 amountIn, uint128 amountOut);
    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB);
    
    modifier onlyProtected() {
        // Use Transaction Guard's protected modifier
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, msg.data, block.timestamp));
        if (!transactionGuard.isTransactionSafe(txHash)) revert TransactionBlocked();
        _;
    }
    
    constructor(address _transactionGuard) {
        transactionGuard = OptimizedTransactionGuard(_transactionGuard);
    }
    
    /**
     * @dev Create a new liquidity pool (PROTECTED)
     */
    function createPool(address tokenA, address tokenB) external onlyProtected returns (bytes32 poolId) {
        if (tokenA == address(0) || tokenB == address(0)) revert InvalidToken();
        if (tokenA == tokenB) revert InvalidToken();
        
        poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        Pool storage pool = pools[poolId];
        
        if (pool.tokenA != address(0)) revert PoolDoesNotExist(); // Pool already exists
        
        pool.tokenA = tokenA;
        pool.tokenB = tokenB;
        poolIds.push(poolId);
        
        // Unchecked increment for gas efficiency
        unchecked {
            ++totalPools;
        }
        
        emit PoolCreated(poolId, tokenA, tokenB);
    }
    
    /**
     * @dev Add liquidity to a pool (PROTECTED)
     */
    function addLiquidity(
        bytes32 poolId,
        uint128 amountA,
        uint128 amountB,
        uint128 minAmountA,
        uint128 minAmountB
    ) external onlyProtected nonReentrant {
        Pool storage pool = pools[poolId];
        if (pool.tokenA == address(0)) revert PoolDoesNotExist();
        
        uint128 actualAmountA = amountA;
        uint128 actualAmountB = amountB;
        
        // Calculate optimal amounts if pool has existing liquidity
        if (pool.reserveA > 0 && pool.reserveB > 0) {
            uint128 optimalAmountB = (amountA * pool.reserveB) / pool.reserveA;
            if (optimalAmountB <= amountB) {
                actualAmountB = optimalAmountB;
            } else {
                actualAmountA = (amountB * pool.reserveA) / pool.reserveB;
            }
        }
        
        if (actualAmountA < minAmountA) revert InsufficientAmount();
        if (actualAmountB < minAmountB) revert InsufficientAmount();
        
        // Transfer tokens
        if (!IERC20(pool.tokenA).transferFrom(msg.sender, address(this), actualAmountA)) revert TransferFailed();
        if (!IERC20(pool.tokenB).transferFrom(msg.sender, address(this), actualAmountB)) revert TransferFailed();
        
        // Calculate liquidity tokens to mint
        uint128 liquidityMinted;
        if (pool.totalLiquidity == 0) {
            liquidityMinted = uint128(sqrt(uint256(actualAmountA) * uint256(actualAmountB)));
        } else {
            liquidityMinted = uint128(min(
                (uint256(actualAmountA) * uint256(pool.totalLiquidity)) / uint256(pool.reserveA),
                (uint256(actualAmountB) * uint256(pool.totalLiquidity)) / uint256(pool.reserveB)
            ));
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
        uint128 amountIn,
        uint128 minAmountOut
    ) external onlyProtected nonReentrant {
        Pool storage pool = pools[poolId];
        if (pool.tokenA == address(0)) revert PoolDoesNotExist();
        if (tokenIn != pool.tokenA && tokenIn != pool.tokenB) revert InvalidToken();
        if (amountIn == 0) revert InvalidAmount();
        
        // Determine input/output tokens and reserves
        (address tokenOut, uint128 reserveIn, uint128 reserveOut) = 
            tokenIn == pool.tokenA ? 
            (pool.tokenB, pool.reserveA, pool.reserveB) : 
            (pool.tokenA, pool.reserveB, pool.reserveA);
        
        // Calculate output amount with fee
        uint256 amountInWithFee = uint256(amountIn) * (FEE_DENOMINATOR - FEE_RATE);
        uint128 amountOut = uint128((amountInWithFee * uint256(reserveOut)) / (uint256(reserveIn) * FEE_DENOMINATOR + amountInWithFee));
        
        if (amountOut < minAmountOut) revert InsufficientAmount();
        if (amountOut >= reserveOut) revert InsufficientLiquidity();
        
        // Transfer tokens
        if (!IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn)) revert TransferFailed();
        if (!IERC20(tokenOut).transfer(msg.sender, amountOut)) revert TransferFailed();
        
        // Update reserves
        if (tokenIn == pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        // Update stats
        unchecked {
            ++totalSwaps;
            totalVolume += amountIn;
            totalFees += uint128((uint256(amountIn) * FEE_RATE) / FEE_DENOMINATOR);
        }
        
        emit Swap(poolId, msg.sender, tokenIn, amountIn, amountOut);
    }
    
    /**
     * @dev Remove liquidity (PROTECTED)
     */
    function removeLiquidity(
        bytes32 poolId,
        uint128 liquidityAmount,
        uint128 minAmountA,
        uint128 minAmountB
    ) external onlyProtected nonReentrant {
        Pool storage pool = pools[poolId];
        if (pool.tokenA == address(0)) revert PoolDoesNotExist();
        if (liquidityAmount == 0) revert InvalidAmount();
        if (pool.liquidity[msg.sender] < liquidityAmount) revert InsufficientAmount();
        
        // Calculate amounts to return
        uint128 amountA = uint128((uint256(liquidityAmount) * uint256(pool.reserveA)) / uint256(pool.totalLiquidity));
        uint128 amountB = uint128((uint256(liquidityAmount) * uint256(pool.reserveB)) / uint256(pool.totalLiquidity));
        
        if (amountA < minAmountA) revert InsufficientAmount();
        if (amountB < minAmountB) revert InsufficientAmount();
        
        // Update pool state
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalLiquidity -= liquidityAmount;
        pool.liquidity[msg.sender] -= liquidityAmount;
        
        // Transfer tokens
        if (!IERC20(pool.tokenA).transfer(msg.sender, amountA)) revert TransferFailed();
        if (!IERC20(pool.tokenB).transfer(msg.sender, amountB)) revert TransferFailed();
        
        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB);
    }
    
    /**
     * @dev Get pool information
     */
    function getPoolInfo(bytes32 poolId) external view returns (
        address tokenA,
        address tokenB,
        uint128 reserveA,
        uint128 reserveB,
        uint128 totalLiquidity
    ) {
        Pool storage pool = pools[poolId];
        if (pool.tokenA == address(0)) revert PoolDoesNotExist();
        
        return (
            pool.tokenA,
            pool.tokenB,
            pool.reserveA,
            pool.reserveB,
            pool.totalLiquidity
        );
    }
    
    /**
     * @dev Get user liquidity in a pool
     */
    function getUserLiquidity(bytes32 poolId, address user) external view returns (uint128) {
        return pools[poolId].liquidity[user];
    }
    
    /**
     * @dev Calculate swap output (for frontend)
     */
    function getAmountOut(bytes32 poolId, address tokenIn, uint128 amountIn) 
        external view returns (uint128 amountOut) {
        Pool storage pool = pools[poolId];
        if (tokenIn != pool.tokenA && tokenIn != pool.tokenB) revert InvalidToken();
        
        uint128 reserveIn = tokenIn == pool.tokenA ? pool.reserveA : pool.reserveB;
        uint128 reserveOut = tokenIn == pool.tokenA ? pool.reserveB : pool.reserveA;
        
        uint256 amountInWithFee = uint256(amountIn) * (FEE_DENOMINATOR - FEE_RATE);
        amountOut = uint128((amountInWithFee * uint256(reserveOut)) / (uint256(reserveIn) * FEE_DENOMINATOR + amountInWithFee));
    }
    
    /**
     * @dev Get DEX statistics
     */
    function getDEXStats() external view returns (
        uint64 poolCount,
        uint64 swapCount,
        uint128 volume,
        uint128 fees
    ) {
        return (totalPools, totalSwaps, totalVolume, totalFees);
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
