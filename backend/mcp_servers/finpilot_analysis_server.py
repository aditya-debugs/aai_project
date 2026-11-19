"""
FinPilot Core Financial Analysis MCP Server (Server 1).
Exposes deterministic financial wellness agent capabilities over the Model Context Protocol.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from mcp.server.fastmcp import FastMCP

# Ensure FinPilot root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd
import agents as A

mcp = FastMCP("FinPilot Core Analysis Server", log_level="WARNING")


@mcp.tool()
def normalize_transactions(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Normalize raw transaction records into the canonical FinPilot schema."""
    try:
        df = pd.DataFrame(transactions)
        normalized = A.ingest(df)
        return {
            "status": "success",
            "count": len(normalized),
            "transactions": normalized.to_dict(orient="records"),
        }
    except Exception as exc:
        return {"status": "error", "error_type": "input_error", "message": str(exc)}


@mcp.tool()
def analyze_financial_health(
    income: float,
    balance: float,
    transactions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Computes FinPilot health score /100, savings rate, emergency cushion, and debt ratio."""
    try:
        if not transactions:
            df = pd.DataFrame(columns=["date", "merchant", "amount", "type", "category", "month"])
        else:
            df = pd.DataFrame(transactions)
            if "type" not in df.columns or "merchant" not in df.columns:
                df = A.ingest(df)
            if "category" not in df.columns:
                df = A.categorize(df)
            if "month" not in df.columns and "date" in df.columns:
                df["date"] = pd.to_datetime(df["date"])
                df["month"] = df["date"].dt.to_period("M").astype(str)
        health = A.health_score(df, income, balance)
        return {"status": "success", "health": health}
    except Exception as exc:
        return {"status": "error", "error_type": "execution_error", "message": str(exc)}


@mcp.tool()
def detect_anomalies(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Detects fraud spikes, duplicate merchant charges, and unusual debit amounts using z-scores."""
    try:
        if not transactions:
            return {"status": "success", "anomaly_count": 0, "anomalies": []}
        df = pd.DataFrame(transactions)
        if "type" not in df.columns or "merchant" not in df.columns:
            df = A.ingest(df)
        if "category" not in df.columns:
            df = A.categorize(df)
        anomalies = A.detect_anomalies(df)
        return {
            "status": "success",
            "anomaly_count": len(anomalies),
            "anomalies": anomalies,
        }
    except Exception as exc:
        return {"status": "error", "error_type": "execution_error", "message": str(exc)}


@mcp.tool()
def forecast_cashflow(
    transactions: List[Dict[str, Any]],
    opening_balance: float = 50000.0,
    days: int = 25,
) -> Dict[str, Any]:
    """Simulates 25-day day-by-day cash flow based on recurring bills, income timing, and variable spend."""
    try:
        if not transactions:
            return {"status": "success", "risk": "Low", "min_balance": opening_balance, "safe": True}
        df = pd.DataFrame(transactions)
        if "type" not in df.columns or "merchant" not in df.columns:
            df = A.ingest(df)
        if "category" not in df.columns:
            df = A.categorize(df)
        res = A.forecast(df, opening_balance, days)
        return {
            "status": "success",
            "risk": res.get("risk"),
            "min_balance": res.get("min_balance"),
            "safe": res.get("safe"),
        }
    except Exception as exc:
        return {"status": "error", "error_type": "execution_error", "message": str(exc)}


if __name__ == "__main__":
    mcp.run(transport="stdio")
