"""
FinPilot Full-Stack Backend API (FastAPI).

Exposes:
1. Multi-Agent Financial Pipeline with Deterministic Core + LLM Narration
2. Governance Sentinel with Event Monitoring & Governance (EMG) Logging & Circuit Breaker
3. Complete Guardrails Agent Harness (Pre-flight PII/Injection, Post-flight, 10-vector Adversarial Suite)
4. Dynamic Multi-RAG Query Router across 4 specialized knowledge bases
5. Multi-MCP Server Bus Registry and Tool Playground
6. Parameter Lineage & Transformation Tracker ("What parameters go where")
7. Public Financial Standards & Benchmarks Explorer
8. Static Mount for React Frontend
"""
from __future__ import annotations

import json
import os
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure FinPilot root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd
import agents as A

from backend.governance.emg_sentinel import governance_sentinel
from backend.guardrails.harness import guardrails_harness
from backend.rag.knowledge_bases import rag_registry
from backend.rag.router import rag_router
from backend.parameters.lineage_tracker import lineage_tracker

app = FastAPI(
    title="FinPilot Autonomous Financial Wellness Platform",
    description="Multi-Agent AI Financial System with EMG Governance, Guardrails Harness, Multi-MCP, and Multi-RAG",
    version="2.0.0",
)

# CORS configuration for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------
class PipelineRunRequest(BaseModel):
    source: Literal["sample", "custom"] = "sample"
    transactions: Optional[List[Dict[str, Any]]] = None
    opening_balance: float = 100000.0
    monthly_income: float = 50000.0
    overrides: Optional[Dict[str, str]] = None
    preferred_rag: str = "auto"
    risk_level: str = "MEDIUM"


class SanitizeRequest(BaseModel):
    text: str


class RAGQueryRequest(BaseModel):
    query: str
    rag_name: str = "auto"
    top_k: int = 3


class CircuitBreakerRequest(BaseModel):
    trip: bool
    reason: str = "Administrator toggle"


class MCPCallRequest(BaseModel):
    server: str
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)


# Helper to make pandas/numpy serializable
def json_safe(val: Any) -> Any:
    if isinstance(val, (pd.Timestamp,)):
        return val.isoformat()
    if isinstance(val, pd.DataFrame):
        return val.to_dict(orient="records")
    if isinstance(val, dict):
        return {str(k): json_safe(v) for k, v in val.items()}
    if isinstance(val, (list, tuple)):
        return [json_safe(v) for v in val]
    return val


# ---------------------------------------------------------------------------
# 1. System Health & Architecture Diagram
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "FinPilot Agentic Platform",
        "circuit_breaker_tripped": governance_sentinel.circuit_breaker_tripped,
        "circuit_breaker_reason": governance_sentinel.circuit_breaker_reason,
        "active_mcp_servers": 3,
        "active_rag_engines": 4,
        "governance_standard": "ISO/IEC 42001 & EMG Sentinel",
    }


@app.get("/api/diagram")
async def get_architecture_diagram():
    """Returns nodes and edges for the Interactive System Architecture Diagram."""
    nodes = [
        {"id": "node_input", "label": "1. User Statement / Upload", "category": "Input", "color": "#06b6d4"},
        {"id": "node_guardrails", "label": "2. Pre-flight Guardrails Harness", "category": "Security", "color": "#10b981"},
        {"id": "node_orchestrator", "label": "3. Master Orchestrator (Planner)", "category": "Orchestration", "color": "#6366f1"},
        {"id": "node_agents", "label": "4. Multi-Agent Pipeline (11 Agents)", "category": "Analysis", "color": "#3b82f6"},
        {"id": "node_multi_rag", "label": "5. Dynamic Multi-RAG Router", "category": "Knowledge", "color": "#8b5cf6"},
        {"id": "node_multi_mcp", "label": "6. Multi-MCP Server Bus (3 Servers)", "category": "Tools", "color": "#ec4899"},
        {"id": "node_governance", "label": "7. Governance EMG Sentinel", "category": "Governance", "color": "#ef4444"},
        {"id": "node_reviewer", "label": "8. Output Reviewer Guardrail", "category": "Validation", "color": "#f59e0b"},
        {"id": "node_output", "label": "9. React Client UI Dashboard", "category": "Frontend", "color": "#14b8a6"},
    ]

    edges = [
        {"from": "node_input", "to": "node_guardrails", "label": "Raw payload"},
        {"from": "node_guardrails", "to": "node_orchestrator", "label": "Sanitized stream"},
        {"from": "node_orchestrator", "to": "node_agents", "label": "Plan sequence"},
        {"from": "node_agents", "to": "node_multi_rag", "label": "Financial snapshot"},
        {"from": "node_multi_rag", "to": "node_agents", "label": "Grounded facts"},
        {"from": "node_agents", "to": "node_multi_mcp", "label": "JSON-RPC tool call"},
        {"from": "node_multi_mcp", "to": "node_agents", "label": "Tool result"},
        {"from": "node_agents", "to": "node_reviewer", "label": "Candidate advice"},
        {"from": "node_reviewer", "to": "node_governance", "label": "Final state"},
        {"from": "node_governance", "to": "node_output", "label": "EMG attested state"},
        {"from": "node_governance", "to": "node_multi_mcp", "label": "Circuit killswitch", "style": "dashed"},
    ]

    contracts = lineage_tracker.get_node_contracts()

    return {
        "nodes": nodes,
        "edges": edges,
        "contracts": contracts,
        "circuit_breaker": {
            "tripped": governance_sentinel.circuit_breaker_tripped,
            "reason": governance_sentinel.circuit_breaker_reason,
        },
    }


# ---------------------------------------------------------------------------
# 2. Parameter Lineage & Details ("What parameters go where")
# ---------------------------------------------------------------------------
@app.get("/api/parameters/lineage")
async def get_parameter_lineage():
    """Returns the end-to-end parameter data-flow lineage matrix."""
    return {
        "steps": lineage_tracker.get_standard_parameter_flow(),
        "node_contracts": lineage_tracker.get_node_contracts(),
    }


# ---------------------------------------------------------------------------
# 3. Financial Wellness Pipeline Execution
# ---------------------------------------------------------------------------
@app.post("/api/pipeline/run")
async def run_pipeline_api(payload: PipelineRunRequest):
    """Executes the full 11-agent financial wellness pipeline with complete observability."""
    trace_id = f"TR-{uuid.uuid4().hex[:8].upper()}"

    # Check Circuit Breaker
    if governance_sentinel.circuit_breaker_tripped:
        raise HTTPException(
            status_code=503,
            detail=f"Execution rejected: Emergency Circuit Breaker is TRIPPED ({governance_sentinel.circuit_breaker_reason})",
        )

    # 1. Pre-flight Guardrail check on input metadata
    guard_input = guardrails_harness.evaluate_input(f"Opening balance {payload.opening_balance}, income {payload.monthly_income}")
    if not guard_input.passed:
        governance_sentinel.log_event(
            agent_role="Guardrails Harness",
            actor="user",
            action="PRE_FLIGHT_INPUT_REJECTED",
            parameters={"balance": payload.opening_balance, "income": payload.monthly_income},
            severity="CRITICAL",
            governance_disposition="REJECTED",
            risk_score=0.9,
            reason=guard_input.rejection_reason or "Input violated security guardrails",
            trace_id=trace_id,
        )
        raise HTTPException(status_code=400, detail=guard_input.rejection_reason)

    # 2. Ingest Data
    if payload.source == "custom" and payload.transactions:
        raw_df = pd.DataFrame(payload.transactions)
    else:
        sample_path = BASE_DIR / "data" / "transactions.csv"
        if not sample_path.is_file():
            from data.generate_data import make
            make()
        raw_df = pd.read_csv(sample_path)

    profile_path = BASE_DIR / "data" / "profile.json"
    profile = {}
    if profile_path.is_file():
        try:
            profile = json.loads(profile_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    profile["opening_balance"] = payload.opening_balance
    profile["monthly_income"] = payload.monthly_income

    # 3. Execute 11-Agent Pipeline
    normalized = A.ingest(raw_df)
    state = A.run_pipeline(normalized, profile, payload.overrides)
    df = state["df"]
    health = state["health"]
    forecast = state["forecast"]

    # 4. Dynamic Multi-RAG Routing
    rag_query = f"Income ₹{state.get('income', 0):,.0f}, savings rate {health.get('savings_rate', 0):.1%}, emergency cushion {health.get('emergency_months', 0):.1f} months, top spend category, risk {forecast.get('risk')}"
    rag_result = rag_router.classify_and_route(
        query=rag_query,
        preferred_rag=payload.preferred_rag,
        top_k=4,
    )

    # 5. Output Guardrail Check
    narrative_text = state.get("narrative") if isinstance(state.get("narrative"), str) else json.dumps(state.get("narrative"))
    guard_output = guardrails_harness.evaluate_output(narrative_text)

    # 6. Governance Sentinel & EMG Audit Logging
    safety_passed, safety_msg = governance_sentinel.evaluate_pipeline_safety(state, trace_id)
    emg_rec = governance_sentinel.log_event(
        agent_role="Master Orchestrator",
        actor="orchestrator",
        action="PIPELINE_RUN_COMPLETED",
        parameters={
            "transaction_count": len(df),
            "health_score": health.get("score"),
            "savings_rate": health.get("savings_rate"),
            "risk": forecast.get("risk"),
            "anomalies_count": len(state.get("anomalies", [])),
            "chosen_rag": rag_result.get("chosen_rag"),
        },
        severity="INFO" if safety_passed else "WARNING",
        governance_disposition="APPROVED" if safety_passed else "MODIFIED",
        risk_score=0.2 if safety_passed else 0.7,
        reason=f"Pipeline executed successfully. {safety_msg}",
        trace_id=trace_id,
        metadata={"preferred_rag": payload.preferred_rag, "chosen_rag": rag_result.get("chosen_rag")},
    )

    # 7. Format clean JSON response
    # Monthly spend pivot
    monthly_dict = {}
    if hasattr(state.get("spending", {}).get("monthly"), "to_dict"):
        m_df = state["spending"]["monthly"].reset_index()
        monthly_dict = m_df.to_dict(orient="records")

    forecast_safe = {
        "risk": forecast.get("risk", "Low"),
        "min_balance": round(float(forecast.get("min_balance", 0)), 2),
        "daily_variable": round(float(forecast.get("daily_variable", 0)), 2),
        "end_balance": round(float(forecast.get("end_balance", 0)), 2),
        "safe": forecast.get("risk") != "HIGH",
    }
    if "series" in forecast and hasattr(forecast["series"], "to_dict"):
        s_df = forecast["series"].copy()
        if "date" in s_df.columns:
            s_df["date"] = s_df["date"].astype(str)
        forecast_safe["series"] = s_df.to_dict(orient="records")

    return {
        "status": "success",
        "trace_id": trace_id,
        "summary": {
            "transaction_count": len(df),
            "health_score": health.get("score", 0),
            "balance": round(state.get("balance", 0), 2),
            "savings_rate": round(health.get("savings_rate", 0), 4),
            "emergency_months": round(health.get("emergency_months", 0), 2),
            "cash_flow_risk": forecast.get("risk", "Low"),
            "alert_count": len(state.get("alerts", [])),
            "anomalies_count": len(state.get("anomalies", [])),
        },
        "health": health,
        "balance": state.get("balance"),
        "income": state.get("income"),
        "spending": {
            "insights": state.get("spending", {}).get("insights", []),
            "monthly_records": monthly_dict,
        },
        "budget": state.get("budget", {}),
        "anomalies": state.get("anomalies", []),
        "subscriptions": state.get("subs", []),
        "forecast": forecast_safe,
        "advice": state.get("advice", []),
        "alerts": state.get("alerts", []),
        "review": state.get("review", {}),
        "narrative": state.get("narrative", {}),
        "rag_context": rag_result,
        "emg_record": emg_rec.to_dict(),
        "guardrails": {
            "pre_flight_passed": guard_input.passed,
            "post_flight_passed": guard_output.passed,
            "pii_redacted": guard_input.pii_redacted,
            "redactions_count": guard_input.redaction_count,
        },
        "trace": state.get("trace", []),
    }


# ---------------------------------------------------------------------------
# 4. Upload Statement (CSV / JSON / PDF)
# ---------------------------------------------------------------------------
@app.post("/api/pipeline/upload")
async def upload_statement(file: UploadFile = File(...)):
    """Uploads and normalizes a custom financial statement."""
    content = await file.read()
    filename = file.filename or "statement"

    # Pre-flight check on filename
    pre = guardrails_harness.evaluate_input(filename)
    if not pre.passed:
        raise HTTPException(status_code=400, detail=pre.rejection_reason)

    try:
        if filename.lower().endswith(".pdf"):
            raw = A.parse_pdf_file(content)
        elif filename.lower().endswith(".json"):
            raw = json.loads(content.decode("utf-8"))
        else:
            import io
            raw = pd.read_csv(io.BytesIO(content))

        normalized = A.ingest(raw)
        return {
            "status": "success",
            "filename": filename,
            "record_count": len(normalized),
            "sample_records": normalized.head(10).to_dict(orient="records"),
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse statement: {exc}")


# ---------------------------------------------------------------------------
# 5. Guardrails Agent Endpoints & Adversarial Test Suite
# ---------------------------------------------------------------------------
@app.post("/api/guardrails/harness-suite")
async def run_guardrails_suite():
    """Runs the 10-vector adversarial test suite and returns scorecard."""
    return guardrails_harness.run_adversarial_suite()


@app.post("/api/guardrails/sanitize")
async def sanitize_text_api(payload: SanitizeRequest):
    """Sanitizes input text, detecting injection attacks and scrubbing financial PII."""
    pre = guardrails_harness.evaluate_input(payload.text)
    return {
        "passed": pre.passed,
        "sanitized_text": pre.sanitized_input,
        "injection_detected": pre.injection_detected,
        "path_traversal_detected": pre.path_traversal_detected,
        "pii_redacted": pre.pii_redacted,
        "redaction_count": pre.redaction_count,
        "redactions": pre.redactions,
        "rejection_reason": pre.rejection_reason,
    }


# ---------------------------------------------------------------------------
# 6. Governance & EMG Sentinel Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/governance/emg-logs")
async def get_emg_logs(limit: int = 50):
    """Fetches real-time structured Event Monitoring & Governance (EMG) logs."""
    logs = governance_sentinel.get_audit_trail(limit=limit)
    return {
        "count": len(logs),
        "circuit_breaker_tripped": governance_sentinel.circuit_breaker_tripped,
        "circuit_breaker_reason": governance_sentinel.circuit_breaker_reason,
        "logs": logs,
    }


@app.get("/api/governance/circuit-breaker/status")
async def get_circuit_breaker_status():
    return {
        "tripped": governance_sentinel.circuit_breaker_tripped,
        "reason": governance_sentinel.circuit_breaker_reason,
        "tripped_at": governance_sentinel.circuit_breaker_tripped_at,
    }


@app.post("/api/governance/circuit-breaker")
async def toggle_circuit_breaker(payload: CircuitBreakerRequest):
    if payload.trip:
        governance_sentinel.trip_circuit_breaker(reason=payload.reason, actor="admin_api")
    else:
        governance_sentinel.reset_circuit_breaker(reason=payload.reason, actor="admin_api")
    return {
        "status": "success",
        "circuit_breaker_tripped": governance_sentinel.circuit_breaker_tripped,
        "reason": governance_sentinel.circuit_breaker_reason,
    }


# ---------------------------------------------------------------------------
# 7. Multi-RAG Query Routing & Knowledge Bases
# ---------------------------------------------------------------------------
@app.get("/api/rag/engines")
async def list_rag_engines():
    """Lists the 4 specialized RAG knowledge bases."""
    return {"engines": rag_registry.list_engines()}


@app.post("/api/rag/query")
async def query_rag_engine(payload: RAGQueryRequest):
    """Classifies user query intent and retrieves grounded facts."""
    return rag_router.classify_and_route(
        query=payload.query,
        preferred_rag=payload.rag_name,
        top_k=payload.top_k,
    )


# ---------------------------------------------------------------------------
# 8. Multi-MCP Server Bus Registry & Playground
# ---------------------------------------------------------------------------
@app.get("/api/mcp/servers")
async def list_mcp_servers():
    """Lists registered FastMCP servers in the ecosystem."""
    return {
        "servers": [
            {
                "id": "finpilot_analysis_server",
                "name": "FinPilot Core Financial Analysis Server",
                "description": "Deterministic financial calculations: normalization, health scoring, anomalies, cash-flow forecast.",
                "transport": "FastMCP (stdio JSON-RPC)",
                "tool_count": 4,
                "status": "ACTIVE",
            },
            {
                "id": "financial_public_data_server",
                "name": "Financial Public Data & Regulatory Server",
                "description": "RBI circulars search, Income Tax regime calculator, and household spending benchmarks.",
                "transport": "FastMCP (stdio JSON-RPC)",
                "tool_count": 3,
                "status": "ACTIVE",
            },
            {
                "id": "security_audit_server",
                "name": "FinTech Security & Governance Server",
                "description": "Financial PII scanning, SHA-256 parameter signature attestation, and emergency circuit killswitch.",
                "transport": "FastMCP (stdio JSON-RPC)",
                "tool_count": 3,
                "status": "ACTIVE",
            },
        ]
    }


@app.get("/api/mcp/tools")
async def list_all_mcp_tools():
    """Returns the catalog of all tools exposed by the 3 FastMCP servers."""
    tools = [
        # Server 1 Tools
        {"server": "finpilot_analysis_server", "name": "normalize_transactions", "risk": "LOW", "description": "Normalize heterogeneous records into canonical schema."},
        {"server": "finpilot_analysis_server", "name": "analyze_financial_health", "risk": "LOW", "description": "Calculate FinPilot health score /100 and savings rate."},
        {"server": "finpilot_analysis_server", "name": "detect_anomalies", "risk": "MEDIUM", "description": "Detect fraud spikes and duplicate transactions using z-scores."},
        {"server": "finpilot_analysis_server", "name": "forecast_cashflow", "risk": "LOW", "description": "Simulate 25-day day-by-day cash buffer projection."},
        # Server 2 Tools
        {"server": "financial_public_data_server", "name": "search_rbi_regulations", "risk": "LOW", "description": "Search official RBI circulars regarding liabilities and UPI limits."},
        {"server": "financial_public_data_server", "name": "query_tax_regimes", "risk": "LOW", "description": "Compare New vs Old Income Tax regimes and estimate tax savings."},
        {"server": "financial_public_data_server", "name": "get_household_spending_benchmarks", "risk": "LOW", "description": "Retrieve national spending benchmarks by income tier."},
        # Server 3 Tools
        {"server": "security_audit_server", "name": "scan_financial_pii", "risk": "LOW", "description": "Detect and mask PAN, credit card numbers, Aadhaar, and UPI IDs."},
        {"server": "security_audit_server", "name": "verify_parameter_hash", "risk": "LOW", "description": "Cryptographically verify parameter payload SHA-256 hash."},
        {"server": "security_audit_server", "name": "trigger_emergency_circuit_breaker", "risk": "CRITICAL", "description": "Engage emergency killswitch across all agent tools."},
    ]
    return {"tools": tools}


@app.post("/api/mcp/call")
async def call_mcp_tool(payload: MCPCallRequest):
    """Executes an MCP tool in the server ecosystem."""
    # Check circuit breaker
    if governance_sentinel.circuit_breaker_tripped and payload.tool_name != "verify_parameter_hash":
        raise HTTPException(
            status_code=503,
            detail=f"Tool execution halted: Emergency Circuit Breaker is TRIPPED ({governance_sentinel.circuit_breaker_reason})",
        )

    # Route to tool execution logic
    server = payload.server
    tool = payload.tool_name
    args = payload.arguments

    try:
        if server == "financial_public_data_server":
            from backend.mcp_servers import financial_public_data_server as s2
            if tool == "search_rbi_regulations":
                return s2.search_rbi_regulations(args.get("keyword", "fraud"))
            elif tool == "query_tax_regimes":
                return s2.query_tax_regimes(args.get("income", 1200000.0))
            elif tool == "get_household_spending_benchmarks":
                return s2.get_household_spending_benchmarks(args.get("monthly_income", 75000.0))
            else:
                raise HTTPException(status_code=404, detail=f"Unknown tool '{tool}' on {server}")

        elif server == "security_audit_server":
            from backend.mcp_servers import security_audit_server as s3
            if tool == "scan_financial_pii":
                return s3.scan_financial_pii(args.get("text", ""))
            elif tool == "verify_parameter_hash":
                return s3.verify_parameter_hash(args.get("parameters", {}), args.get("expected_hash", ""))
            elif tool == "trigger_emergency_circuit_breaker":
                return s3.trigger_emergency_circuit_breaker(args.get("reason", "Manual trigger via MCP call"))
            else:
                raise HTTPException(status_code=404, detail=f"Unknown tool '{tool}' on {server}")

        elif server == "finpilot_analysis_server":
            from backend.mcp_servers import finpilot_analysis_server as s1
            if tool == "normalize_transactions":
                return s1.normalize_transactions(args.get("transactions", []))
            elif tool == "analyze_financial_health":
                return s1.analyze_financial_health(args.get("income", 50000.0), args.get("balance", 100000.0), args.get("transactions", []))
            elif tool == "detect_anomalies":
                return s1.detect_anomalies(args.get("transactions", []))
            elif tool == "forecast_cashflow":
                return s1.forecast_cashflow(args.get("transactions", []), args.get("opening_balance", 50000.0))
            else:
                raise HTTPException(status_code=404, detail=f"Unknown tool '{tool}' on {server}")
        else:
            raise HTTPException(status_code=404, detail=f"Unknown MCP server '{server}'")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {exc}")


# ---------------------------------------------------------------------------
# 9. Public Financial Data Browsing
# ---------------------------------------------------------------------------
@app.get("/api/public-data/browse")
async def browse_public_data():
    """Returns the catalog of all public standards and regulatory files."""
    pub_dir = BASE_DIR / "backend" / "public_data"
    catalog = {}
    for f in pub_dir.glob("*.json"):
        try:
            catalog[f.stem] = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            pass
    return catalog


# ---------------------------------------------------------------------------
# 10. Mount Frontend Build (if available)
# ---------------------------------------------------------------------------
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
if FRONTEND_DIST.is_dir():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
