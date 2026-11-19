"""
Financial Public Data & Regulatory MCP Server (Server 2).
Exposes public standards, RBI regulations, income tax regimes, and spending benchmarks.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

from mcp.server.fastmcp import FastMCP

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PUBLIC_DATA_DIR = BASE_DIR / "backend" / "public_data"

mcp = FastMCP("Financial Public Data Server", log_level="WARNING")


@mcp.tool()
def search_rbi_regulations(keyword: str = "fraud") -> Dict[str, Any]:
    """Search official Reserve Bank of India circulars regarding liabilities, UPI limits, and security."""
    rbi_file = PUBLIC_DATA_DIR / "rbi_regulations.json"
    if not rbi_file.is_file():
        return {"status": "error", "message": "RBI regulations data not found"}
    try:
        data = json.loads(rbi_file.read_text(encoding="utf-8"))
        kw = keyword.lower()
        matches = [
            item for item in data
            if kw in item.get("title", "").lower()
            or kw in item.get("summary", "").lower()
            or any(kw in c.lower() for c in item.get("key_clauses", []))
        ]
        return {
            "status": "success",
            "query": keyword,
            "match_count": len(matches),
            "results": matches or data[:2],
        }
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


@mcp.tool()
def query_tax_regimes(income: float = 1200000.0) -> Dict[str, Any]:
    """Computes and compares estimated income tax under the New Regime vs Old Regime."""
    tax_file = PUBLIC_DATA_DIR / "tax_regimes.json"
    if not tax_file.is_file():
        return {"status": "error", "message": "Tax regimes data not found"}
    try:
        tax_info = json.loads(tax_file.read_text(encoding="utf-8"))

        # Calculate New Regime tax with ₹75k standard deduction
        taxable_new = max(0.0, income - 75000.0)
        tax_new = 0.0
        if taxable_new <= 700000.0:
            tax_new = 0.0  # u/s 87A rebate
        else:
            # Slabs
            if taxable_new > 300000:
                tax_new += min(400000, taxable_new - 300000) * 0.05
            if taxable_new > 700000:
                tax_new += min(300000, taxable_new - 700000) * 0.10
            if taxable_new > 1000000:
                tax_new += min(200000, taxable_new - 1000000) * 0.15
            if taxable_new > 1200000:
                tax_new += min(300000, taxable_new - 1200000) * 0.20
            if taxable_new > 1500000:
                tax_new += (taxable_new - 1500000) * 0.30

        # Calculate Old Regime baseline (with ₹50k std deduction)
        taxable_old = max(0.0, income - 50000.0)
        tax_old = 0.0
        if taxable_old <= 500000.0:
            tax_old = 0.0
        else:
            if taxable_old > 250000:
                tax_old += min(250000, taxable_old - 250000) * 0.05
            if taxable_old > 500000:
                tax_old += min(500000, taxable_old - 500000) * 0.20
            if taxable_old > 1000000:
                tax_old += (taxable_old - 1000000) * 0.30

        better_regime = "New Regime" if tax_new <= tax_old else "Old Regime"
        savings = abs(tax_old - tax_new)

        return {
            "status": "success",
            "annual_income": income,
            "new_regime_tax": round(tax_new, 2),
            "old_regime_base_tax": round(tax_old, 2),
            "recommended_regime": better_regime,
            "estimated_annual_savings": round(savings, 2),
            "decision_rule": tax_info.get("decision_rule_for_advisor_agent"),
        }
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


@mcp.tool()
def get_household_spending_benchmarks(monthly_income: float = 75000.0) -> Dict[str, Any]:
    """Returns national spending and savings benchmarks for the user's income bracket."""
    bm_file = PUBLIC_DATA_DIR / "spending_benchmarks.json"
    if not bm_file.is_file():
        return {"status": "error", "message": "Benchmarks data not found"}
    try:
        bm_data = json.loads(bm_file.read_text(encoding="utf-8"))
        tiers = bm_data.get("household_spending_distribution_by_income_tier", {})

        if monthly_income < 50000:
            matched_tier = tiers.get("tier_entry_level_under_50k_monthly")
        elif monthly_income <= 150000:
            matched_tier = tiers.get("tier_middle_class_50k_to_150k_monthly")
        else:
            matched_tier = tiers.get("tier_affluent_above_150k_monthly")

        return {
            "status": "success",
            "user_monthly_income": monthly_income,
            "tier_benchmarks": matched_tier,
            "risk_thresholds": bm_data.get("health_risk_thresholds"),
        }
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


if __name__ == "__main__":
    mcp.run(transport="stdio")
