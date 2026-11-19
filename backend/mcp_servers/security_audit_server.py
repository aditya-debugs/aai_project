"""
FinTech Security & Governance MCP Server (Server 3).
Exposes cryptographic parameter validation, PII redaction, and emergency killswitch tools.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

from mcp.server.fastmcp import FastMCP

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.guardrails.harness import mask_pii
from backend.governance.emg_sentinel import governance_sentinel

mcp = FastMCP("FinTech Security & Governance Server", log_level="WARNING")


@mcp.tool()
def scan_financial_pii(text: str) -> Dict[str, Any]:
    """Detects and masks PAN, credit card numbers, Aadhaar, bank accounts, and UPI IDs."""
    sanitized, redactions = mask_pii(text)
    return {
        "status": "success",
        "redactions_count": len(redactions),
        "redactions": redactions,
        "sanitized_text": sanitized,
    }


@mcp.tool()
def verify_parameter_hash(parameters: Dict[str, Any], expected_hash: str) -> Dict[str, Any]:
    """Cryptographically verifies tamper-evidence of a parameter payload using SHA-256."""
    encoded = json.dumps(parameters, sort_keys=True).encode("utf-8")
    actual_hash = hashlib.sha256(encoded).hexdigest()[:16]
    matches = (actual_hash == expected_hash)
    return {
        "status": "success",
        "matches": matches,
        "actual_hash": actual_hash,
        "expected_hash": expected_hash,
        "attestation": "VERIFIED_VALID" if matches else "TAMPER_DETECTED",
    }


@mcp.tool()
def trigger_emergency_circuit_breaker(reason: str) -> Dict[str, Any]:
    """Administrative killswitch to quarantine agent tool executions."""
    governance_sentinel.trip_circuit_breaker(reason=reason, actor="mcp_security_tool")
    return {
        "status": "success",
        "circuit_breaker_tripped": True,
        "reason": reason,
        "message": "Emergency circuit breaker successfully engaged.",
    }


if __name__ == "__main__":
    mcp.run(transport="stdio")
