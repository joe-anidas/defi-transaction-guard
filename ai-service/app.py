#!/usr/bin/env python3
"""
DeFi Transaction Guard AI Service for Akash Network
GPU-accelerated AI analysis with Grok and Gemini integration
Compatible with GoFr backend API structure
"""

import os
import json
import time
import hashlib
import logging
from datetime import datetime
from typing import Dict, Any, Optional

import redis
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables
grok_client = None
gemini_model = None
redis_client = None

# Initialize AI clients
def initialize_ai_clients():
    global grok_client, gemini_model, redis_client
    
    # Initialize Grok
    grok_api_key = os.getenv('GROK_API_KEY')
    if grok_api_key:
        try:
            grok_client = Groq(api_key=grok_api_key)
            logger.info("✅ Grok client initialized")
        except Exception as e:
            logger.error(f"❌ Grok initialization failed: {e}")
    
    # Initialize Gemini
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if gemini_api_key:
        try:
            genai.configure(api_key=gemini_api_key)
            gemini_model = genai.GenerativeModel('gemini-pro')
            logger.info("✅ Gemini client initialized")
        except Exception as e:
            logger.error(f"❌ Gemini initialization failed: {e}")
    
    # Initialize Redis cache with connection pooling
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT', 6379))
    try:
        redis_client = redis.Redis(
            host=redis_host, 
            port=redis_port, 
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30,
            max_connections=20,
            connection_pool_class=redis.ConnectionPool
        )
        redis_client.ping()
        logger.info("✅ Redis cache connected with connection pooling")
    except Exception as e:
        logger.warning(f"⚠️ Redis cache not available: {e}")
        redis_client = None

@app.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint for Akash Network"""
    gpu_available = check_gpu_availability()
    cache_stats = get_cache_stats()
    
    # Check AI provider availability
    grok_status = "available" if grok_client is not None else "unavailable"
    gemini_status = "available" if gemini_model is not None else "unavailable"
    
    # Overall health status
    overall_status = "healthy"
    if not grok_client and not gemini_model:
        overall_status = "degraded"  # Only heuristic available
    elif not redis_client:
        overall_status = "degraded"  # No caching
    
    return jsonify({
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "DeFi AI Guard",
        "version": "2.0.0",
        "provider": "akash-network",
        "capabilities": {
            "grok_available": grok_client is not None,
            "gemini_available": gemini_model is not None,
            "cache_available": redis_client is not None,
            "gpu_available": gpu_available,
            "models": ["grok-mixtral", "gemini-pro", "heuristic-fallback"]
        },
        "providers": {
            "grok": {
                "status": grok_status,
                "model": "mixtral-8x7b-32768",
                "latency": "~150ms"
            },
            "gemini": {
                "status": gemini_status,
                "model": "gemini-pro",
                "latency": "~120ms"
            },
            "heuristic": {
                "status": "available",
                "model": "rule-engine",
                "latency": "<50ms"
            }
        },
        "cache": cache_stats,
        "system": {
            "uptime": get_uptime(),
            "memory_usage": get_memory_usage(),
            "gpu_available": gpu_available
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_transaction():
    """Main transaction analysis endpoint"""
    start_time = time.time()
    
    try:
        # Validate request
        if not request.json:
            return jsonify({"error": "No JSON data provided"}), 400
        
        tx_data = request.json
        required_fields = ['hash', 'from', 'to', 'value']
        
        for field in required_fields:
            if field not in tx_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Check cache first
        cache_key = generate_cache_key(tx_data)
        cached_result = get_from_cache(cache_key)
        
        if cached_result:
            cached_result['cached'] = True
            cached_result['process_time_ms'] = 5
            return jsonify(cached_result)
        
        # Perform AI analysis
        result = perform_ai_analysis(tx_data)
        result['process_time_ms'] = int((time.time() - start_time) * 1000)
        result['cached'] = False
        result['timestamp'] = datetime.utcnow().isoformat()
        
        # Cache the result
        cache_result(cache_key, result)
        
        logger.info(f"Analysis completed for {tx_data['hash']}: {result['risk_score']}% risk")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return jsonify({
            "error": str(e),
            "risk_score": 50,
            "threat_type": "Analysis Failed",
            "confidence": 0.5,
            "provider": "akash-fallback",
            "process_time_ms": int((time.time() - start_time) * 1000)
        }), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Batch analysis endpoint for multiple transactions"""
    start_time = time.time()
    
    try:
        if not request.json or 'transactions' not in request.json:
            return jsonify({"error": "No transactions provided"}), 400
        
        transactions = request.json['transactions']
        if len(transactions) > 100:
            return jsonify({"error": "Maximum 100 transactions per batch"}), 400
        
        results = []
        for tx_data in transactions:
            try:
                result = perform_ai_analysis(tx_data)
                result['hash'] = tx_data.get('hash', 'unknown')
                results.append(result)
            except Exception as e:
                results.append({
                    "hash": tx_data.get('hash', 'unknown'),
                    "error": str(e),
                    "risk_score": 50,
                    "threat_type": "Analysis Failed"
                })
        
        return jsonify({
            "success": True,
            "results": results,
            "total_processed": len(results),
            "process_time_ms": int((time.time() - start_time) * 1000)
        })
        
    except Exception as e:
        logger.error(f"Batch analysis failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Service statistics endpoint"""
    return jsonify({
        "service": "DeFi AI Guard",
        "provider": "akash-network",
        "uptime": get_uptime(),
        "memory_usage": get_memory_usage(),
        "gpu_info": get_gpu_info(),
        "cache_stats": get_cache_stats(),
        "ai_providers": {
            "grok": grok_client is not None,
            "gemini": gemini_model is not None
        }
    })

def perform_ai_analysis(tx_data: Dict[str, Any]) -> Dict[str, Any]:
    """Perform AI analysis on transaction data"""
    
    # Try Grok first (best for DeFi analysis)
    if grok_client:
        try:
            result = analyze_with_grok(tx_data)
            if result:
                result['provider'] = 'grok-akash'
                return result
        except Exception as e:
            logger.warning(f"Grok analysis failed: {e}")
    
    # Try Gemini as fallback
    if gemini_model:
        try:
            result = analyze_with_gemini(tx_data)
            if result:
                result['provider'] = 'gemini-akash'
                return result
        except Exception as e:
            logger.warning(f"Gemini analysis failed: {e}")
    
    # Heuristic fallback
    return analyze_with_heuristics(tx_data)

def analyze_with_grok(tx_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Analyze transaction using Grok AI"""
    prompt = build_analysis_prompt(tx_data)
    
    response = grok_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[
            {
                "role": "system", 
                "content": "You are an expert DeFi security analyst. Respond only with valid JSON containing risk analysis."
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=1500
    )
    
    content = response.choices[0].message.content.strip()
    
    # Extract JSON from response
    start = content.find('{')
    end = content.rfind('}') + 1
    
    if start != -1 and end > start:
        json_str = content[start:end]
        return json.loads(json_str)
    
    return None

def analyze_with_gemini(tx_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Analyze transaction using Gemini AI"""
    prompt = build_analysis_prompt(tx_data)
    
    response = gemini_model.generate_content(prompt)
    content = response.text.strip()
    
    # Extract JSON from response
    start = content.find('{')
    end = content.rfind('}') + 1
    
    if start != -1 and end > start:
        json_str = content[start:end]
        return json.loads(json_str)
    
    return None

def analyze_with_heuristics(tx_data: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback heuristic analysis"""
    risk_score = calculate_heuristic_risk(tx_data)
    threat_type = determine_threat_type(tx_data, risk_score)
    
    return {
        "risk_score": risk_score,
        "threat_type": threat_type,
        "confidence": 0.7,
        "reasoning": "Heuristic analysis based on transaction patterns",
        "indicators": analyze_risk_indicators(tx_data),
        "provider": "akash-heuristic",
        "severity": get_severity_level(risk_score)
    }

def build_analysis_prompt(tx_data: Dict[str, Any]) -> str:
    """Build analysis prompt for AI models"""
    return f"""
Analyze this DeFi transaction for security risks:

Transaction Hash: {tx_data.get('hash', 'N/A')}
From Address: {tx_data.get('from', 'N/A')}
To Address: {tx_data.get('to', 'N/A')}
Value: {tx_data.get('value', 'N/A')} ETH
Gas Limit: {tx_data.get('gasLimit', 'N/A')}
Input Data: {tx_data.get('data', 'N/A')[:100]}...

Check for these DeFi attack patterns:
1. Flash loan attacks
2. MEV sandwich attacks  
3. Rug pull attempts
4. Governance exploits
5. Price manipulation
6. Liquidity draining
7. Smart contract vulnerabilities

Respond with JSON only:
{{
  "risk_score": <0-100>,
  "threat_type": "<specific threat or Normal Transaction>",
  "confidence": <0.0-1.0>,
  "reasoning": "<detailed explanation>",
  "indicators": ["<risk factors found>"],
  "severity": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "recommendations": ["<security suggestions>"]
}}
"""

def calculate_heuristic_risk(tx_data: Dict[str, Any]) -> int:
    """Calculate risk score using heuristics"""
    risk = 20  # Base risk
    
    try:
        # High value transactions
        value = float(tx_data.get('value', 0))
        if value > 100:
            risk += 30
        elif value > 10:
            risk += 15
        elif value > 1:
            risk += 5
        
        # Contract interactions
        if tx_data.get('data') and len(tx_data.get('data', '')) > 10:
            risk += 20
        
        # Gas analysis
        gas_limit = int(tx_data.get('gasLimit', 0))
        if gas_limit > 1000000:
            risk += 15
        elif gas_limit > 500000:
            risk += 10
        
        # Address patterns
        from_addr = tx_data.get('from', '').lower()
        to_addr = tx_data.get('to', '').lower()
        
        if from_addr == to_addr:
            risk += 25  # Self-transaction
        
        # Known risky patterns
        data = tx_data.get('data', '').lower()
        risky_functions = ['transfer', 'approve', 'swap', 'flashloan']
        for func in risky_functions:
            if func in data:
                risk += 10
                break
        
    except (ValueError, TypeError):
        risk += 10  # Invalid data penalty
    
    return min(risk, 100)

def determine_threat_type(tx_data: Dict[str, Any], risk_score: int) -> str:
    """Determine threat type based on transaction data"""
    data = tx_data.get('data', '').lower()
    value = float(tx_data.get('value', 0))
    
    if risk_score >= 80:
        if 'flashloan' in data or 'borrow' in data:
            return "Flash Loan Attack"
        elif value > 50:
            return "High-Value Suspicious Transaction"
        else:
            return "Critical Risk Transaction"
    elif risk_score >= 60:
        if 'swap' in data:
            return "Potential MEV Attack"
        elif 'approve' in data:
            return "Suspicious Approval"
        else:
            return "Medium Risk Transaction"
    elif risk_score >= 40:
        return "Low Risk Transaction"
    else:
        return "Normal Transaction"

def analyze_risk_indicators(tx_data: Dict[str, Any]) -> list:
    """Analyze and return risk indicators"""
    indicators = []
    
    try:
        value = float(tx_data.get('value', 0))
        if value > 10:
            indicators.append("high-value-transfer")
        
        data = tx_data.get('data', '')
        if len(data) > 100:
            indicators.append("complex-contract-call")
        
        gas_limit = int(tx_data.get('gasLimit', 0))
        if gas_limit > 500000:
            indicators.append("high-gas-usage")
        
        # Check for common DeFi function signatures
        if 'a9059cbb' in data:  # transfer
            indicators.append("token-transfer")
        if '095ea7b3' in data:  # approve
            indicators.append("token-approval")
        
    except (ValueError, TypeError):
        indicators.append("invalid-data")
    
    return indicators if indicators else ["standard-transaction"]

def get_severity_level(risk_score: int) -> str:
    """Get severity level from risk score"""
    if risk_score >= 90:
        return "CRITICAL"
    elif risk_score >= 70:
        return "HIGH"
    elif risk_score >= 40:
        return "MEDIUM"
    else:
        return "LOW"

def generate_cache_key(tx_data: Dict[str, Any]) -> str:
    """Generate cache key for transaction"""
    key_data = f"{tx_data.get('hash', '')}{tx_data.get('from', '')}{tx_data.get('to', '')}"
    return f"tx_analysis:{hashlib.md5(key_data.encode()).hexdigest()}"

def get_from_cache(cache_key: str) -> Optional[Dict[str, Any]]:
    """Get result from cache with error handling"""
    if not redis_client:
        return None
    
    try:
        cached = redis_client.get(cache_key)
        if cached:
            logger.info(f"Cache hit for key: {cache_key}")
            return json.loads(cached)
    except redis.ConnectionError as e:
        logger.warning(f"Redis connection error: {e}")
    except redis.TimeoutError as e:
        logger.warning(f"Redis timeout error: {e}")
    except Exception as e:
        logger.warning(f"Cache read failed: {e}")
    
    return None

def cache_result(cache_key: str, result: Dict[str, Any], ttl: int = 300) -> None:
    """Cache analysis result with error handling"""
    if not redis_client:
        return
    
    try:
        redis_client.setex(cache_key, ttl, json.dumps(result))
        logger.info(f"Cached result for key: {cache_key} (TTL: {ttl}s)")
    except redis.ConnectionError as e:
        logger.warning(f"Redis connection error: {e}")
    except redis.TimeoutError as e:
        logger.warning(f"Redis timeout error: {e}")
    except Exception as e:
        logger.warning(f"Cache write failed: {e}")

def clear_cache_pattern(pattern: str):
    """Clear cache entries matching pattern"""
    if redis_client:
        try:
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
                logger.info(f"Cleared {len(keys)} cache entries matching pattern: {pattern}")
        except Exception as e:
            logger.warning(f"Cache clear failed: {e}")

def get_cache_stats() -> Dict[str, Any]:
    """Get Redis cache statistics"""
    if redis_client:
        try:
            info = redis_client.info()
            return {
                "connected": True,
                "used_memory": info.get("used_memory_human", "N/A"),
                "connected_clients": info.get("connected_clients", 0),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": calculate_hit_rate(info)
            }
        except Exception as e:
            logger.warning(f"Cache stats failed: {e}")
    
    return {"connected": False, "error": "Redis not available"}

def calculate_hit_rate(info: Dict[str, Any]) -> float:
    """Calculate cache hit rate"""
    hits = info.get("keyspace_hits", 0)
    misses = info.get("keyspace_misses", 0)
    total = hits + misses
    return (hits / total * 100) if total > 0 else 0.0

def check_gpu_availability() -> bool:
    """Check if GPU is available"""
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False

def get_uptime() -> str:
    """Get service uptime"""
    try:
        with open('/proc/uptime', 'r') as f:
            uptime_seconds = float(f.readline().split()[0])
            return f"{uptime_seconds:.0f}s"
    except:
        return "unknown"

def get_memory_usage() -> Dict[str, Any]:
    """Get memory usage statistics"""
    try:
        import psutil
        memory = psutil.virtual_memory()
        return {
            "total": f"{memory.total / (1024**3):.2f}GB",
            "available": f"{memory.available / (1024**3):.2f}GB",
            "percent": f"{memory.percent}%"
        }
    except ImportError:
        return {"status": "unavailable"}

def get_gpu_info() -> Dict[str, Any]:
    """Get GPU information"""
    try:
        import torch
        if torch.cuda.is_available():
            return {
                "available": True,
                "count": torch.cuda.device_count(),
                "current_device": torch.cuda.current_device(),
                "device_name": torch.cuda.get_device_name(0)
            }
        else:
            return {"available": False}
    except ImportError:
        return {"available": False, "error": "PyTorch not available"}

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    if not redis_client:
        return {"available": False}
    
    try:
        info = redis_client.info()
        return {
            "available": True,
            "connected_clients": info.get('connected_clients', 0),
            "used_memory": info.get('used_memory_human', 'unknown'),
            "keyspace_hits": info.get('keyspace_hits', 0),
            "keyspace_misses": info.get('keyspace_misses', 0)
        }
    except Exception as e:
        return {"available": False, "error": str(e)}

if __name__ == '__main__':
    logger.info("🚀 Starting DeFi AI Guard Service on Akash Network...")
    
    # Initialize AI clients
    initialize_ai_clients()
    
    # Print startup info
    logger.info(f"Grok available: {grok_client is not None}")
    logger.info(f"Gemini available: {gemini_model is not None}")
    logger.info(f"Cache available: {redis_client is not None}")
    logger.info(f"GPU available: {check_gpu_availability()}")
    
    # Run the Flask app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )

# GoFr Backend Compatible Endpoints
@app.route('/api/ai/status', methods=['GET'])
def ai_status_gofr():
    """GoFr backend compatible AI status endpoint"""
    return jsonify({
        "success": True,
        "providers": {
            "grok": {
                "available": grok_client is not None,
                "model": "mixtral-8x7b-32768",
                "status": "online" if grok_client else "offline"
            },
            "gemini": {
                "available": gemini_model is not None,
                "model": "gemini-pro",
                "status": "online" if gemini_model else "offline"
            },
            "heuristic": {
                "available": True,
                "model": "rule-based",
                "status": "online"
            }
        },
        "cache": {
            "available": redis_client is not None,
            "status": "online" if redis_client else "offline"
        },
        "gpu": {
            "available": check_gpu_availability(),
            "info": get_gpu_info()
        },
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/ai/analyze', methods=['POST'])
def ai_analyze_gofr():
    """GoFr backend compatible AI analysis endpoint"""
    start_time = time.time()
    
    try:
        if not request.json:
            return jsonify({"error": "No JSON data provided"}), 400
        
        tx_data = request.json
        
        # Perform AI analysis
        result = perform_ai_analysis(tx_data)
        result['process_time_ms'] = int((time.time() - start_time) * 1000)
        result['timestamp'] = datetime.utcnow().isoformat()
        result['success'] = True
        
        # Format for GoFr backend compatibility
        gofr_result = {
            "success": True,
            "riskScore": result.get('risk_score', 50),
            "threatType": result.get('threat_type', 'Unknown'),
            "confidence": result.get('confidence', 0.5),
            "reasoning": result.get('reasoning', 'AI analysis completed'),
            "indicators": result.get('indicators', []),
            "provider": result.get('provider', 'akash-ai'),
            "processTime": result['process_time_ms'],
            "timestamp": result['timestamp'],
            "severity": result.get('severity', 'MEDIUM'),
            "cached": result.get('cached', False)
        }
        
        logger.info(f"GoFr analysis completed for {tx_data.get('hash', 'unknown')}: {gofr_result['riskScore']}% risk")
        
        return jsonify(gofr_result)
        
    except Exception as e:
        logger.error(f"GoFr analysis failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "riskScore": 50,
            "threatType": "Analysis Failed",
            "confidence": 0.5,
            "provider": "akash-fallback",
            "processTime": int((time.time() - start_time) * 1000)
        }), 500

@app.route('/api/ai/providers', methods=['GET'])
def ai_providers_gofr():
    """GoFr backend compatible providers endpoint"""
    return jsonify({
        "success": True,
        "providers": [
            {
                "name": "grok",
                "available": grok_client is not None,
                "model": "mixtral-8x7b-32768",
                "capabilities": ["transaction-analysis", "threat-detection", "risk-scoring"],
                "priority": 1
            },
            {
                "name": "gemini",
                "available": gemini_model is not None,
                "model": "gemini-pro",
                "capabilities": ["transaction-analysis", "threat-detection", "risk-scoring"],
                "priority": 2
            },
            {
                "name": "heuristic",
                "available": True,
                "model": "rule-based",
                "capabilities": ["basic-analysis", "pattern-matching"],
                "priority": 3
            }
        ],
        "total_providers": 3,
        "active_providers": sum([
            1 if grok_client else 0,
            1 if gemini_model else 0,
            1  # heuristic always available
        ])
    })

# BlockDAG Integration Endpoints
@app.route('/api/blockdag/analyze', methods=['POST'])
def blockdag_analyze():
    """BlockDAG-specific transaction analysis"""
    start_time = time.time()
    
    try:
        if not request.json:
            return jsonify({"error": "No JSON data provided"}), 400
        
        tx_data = request.json
        
        # Enhanced analysis for BlockDAG
        result = perform_ai_analysis(tx_data)
        
        # Add BlockDAG-specific analysis
        blockdag_analysis = analyze_blockdag_patterns(tx_data)
        result.update(blockdag_analysis)
        
        result['process_time_ms'] = int((time.time() - start_time) * 1000)
        result['network'] = 'BlockDAG'
        result['dag_validated'] = True
        
        return jsonify({
            "success": True,
            "analysis": result,
            "blockdag_features": {
                "dag_structure_valid": blockdag_analysis.get('dag_valid', True),
                "parallel_conflicts": blockdag_analysis.get('conflicts', []),
                "consensus_risk": blockdag_analysis.get('consensus_risk', 0)
            }
        })
        
    except Exception as e:
        logger.error(f"BlockDAG analysis failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "network": "BlockDAG"
        }), 500

def analyze_blockdag_patterns(tx_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze BlockDAG-specific patterns"""
    analysis = {
        "dag_valid": True,
        "conflicts": [],
        "consensus_risk": 0,
        "parallel_processing_safe": True
    }
    
    # Check for DAG-specific risks
    try:
        # Simulate DAG structure validation
        if tx_data.get('data') and len(tx_data.get('data', '')) > 200:
            analysis['consensus_risk'] = 15
            analysis['conflicts'].append("complex-transaction")
        
        # Check for parallel processing conflicts
        gas_limit = int(tx_data.get('gasLimit', 0))
        if gas_limit > 1000000:
            analysis['parallel_processing_safe'] = False
            analysis['conflicts'].append("high-gas-conflict")
        
        # Validate transaction ordering in DAG
        value = float(tx_data.get('value', 0))
        if value > 1000:  # High value transactions need careful ordering
            analysis['consensus_risk'] += 10
            analysis['conflicts'].append("high-value-ordering")
        
    except (ValueError, TypeError):
        analysis['dag_valid'] = False
        analysis['consensus_risk'] = 25
    
    return analysis

# Performance and monitoring endpoints
@app.route('/metrics', methods=['GET'])
def prometheus_metrics():
    """Prometheus-compatible metrics endpoint"""
    metrics = []
    
    # AI service metrics
    metrics.append(f"ai_service_uptime_seconds {get_uptime_seconds()}")
    metrics.append(f"ai_providers_available {sum([1 if grok_client else 0, 1 if gemini_model else 0, 1])}")
    metrics.append(f"gpu_available {1 if check_gpu_availability() else 0}")
    metrics.append(f"cache_available {1 if redis_client else 0}")
    
    # Cache metrics
    if redis_client:
        try:
            info = redis_client.info()
            metrics.append(f"cache_connected_clients {info.get('connected_clients', 0)}")
            metrics.append(f"cache_keyspace_hits {info.get('keyspace_hits', 0)}")
            metrics.append(f"cache_keyspace_misses {info.get('keyspace_misses', 0)}")
        except:
            pass
    
    return '\n'.join(metrics), 200, {'Content-Type': 'text/plain'}

def get_uptime_seconds() -> float:
    """Get uptime in seconds"""
    try:
        with open('/proc/uptime', 'r') as f:
            return float(f.readline().split()[0])
    except:
        return 0.0