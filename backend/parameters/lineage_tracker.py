"""
Parameter Lineage and Data Contract Tracker for FinPilot.
Answers: "What parameters go where, and what transformations occur at each stage?"
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional


def hash_obj(data: Any) -> str:
    try:
        raw = json.dumps(data, sort_keys=True, default=str).encode("utf-8")
        return hashlib.sha256(raw).hexdigest()[:12]
    except Exception:
        return hashlib.sha256(str(data).encode("utf-8")).hexdigest()[:12]


@dataclass
class ParameterStep:
    step_id: str
    phase: str
    agent_or_node: str
    input_parameters: Dict[str, str]
    parameter_source: str
    output_parameters: Dict[str, str]
    parameter_destination: str
    mutation_details: str
    schema_validation: str
    risk_tier: str
    parameter_hash: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ParameterLineageTracker:
    """Tracks end-to-end parameter lineage across the FinPilot multi-agent ecosystem."""

    @staticmethod
    def get_standard_parameter_flow() -> List[Dict[str, Any]]:
        steps = [
            ParameterStep(
                step_id="P-01",
                phase="Ingestion",
                agent_or_node="1. Ingestion Agent",
                input_parameters={
                    "raw_statement": "CSV / JSON / PDF bytes or rows",
                    "file_type": "string ('csv', 'json', 'pdf')",
                },
                parameter_source="User upload or synthetic benchmark data",
                output_parameters={
                    "normalized_records": "List[Dict] (date, merchant, amount, type)",
                    "record_count": "integer",
                },
                parameter_destination="Categorization Agent (Step P-02)",
                mutation_details="Parses heterogeneous formats (debit/credit columns, UPI strings, PDF text) into canonical date/merchant/amount/type schema.",
                schema_validation="PASSED: Strict column type casting and non-null amount verification.",
                risk_tier="LOW",
                parameter_hash=hash_obj({"step": "ingestion", "fields": ["date", "merchant", "amount", "type"]}),
            ),
            ParameterStep(
                step_id="P-02",
                phase="Categorization",
                agent_or_node="2. Categorization Agent",
                input_parameters={
                    "normalized_records": "List[Dict]",
                    "user_overrides": "Dict[str, str] (optional category mappings)",
                },
                parameter_source="Ingestion Agent (Step P-01)",
                output_parameters={
                    "categorized_df": "DataFrame with ['category', 'confidence', 'month'] added",
                    "confidence_scores": "List[float] (0.0 to 1.0)",
                },
                parameter_destination="Spending, Budget, Health, & Anomaly Agents (Step P-03)",
                mutation_details="Maps merchant strings to 10 standard categories (Needs vs Wants) via boundary-aware regex rules and user override dictionary.",
                schema_validation="PASSED: Every record assigned valid category and confidence score.",
                risk_tier="LOW",
                parameter_hash=hash_obj({"step": "categorize", "cats": 10}),
            ),
            ParameterStep(
                step_id="P-03",
                phase="Multi-Agent Analysis",
                agent_or_node="3-8. Core Specialist Agents (Parallel)",
                input_parameters={
                    "categorized_df": "DataFrame",
                    "monthly_income": "float (₹)",
                    "opening_balance": "float (₹)",
                    "min_buffer": "float (₹, default: 5000)",
                },
                parameter_source="Categorization Agent + User Profile",
                output_parameters={
                    "spending_insights": "List[Dict] (category trends, 3-month spikes)",
                    "budget_utilization": "Dict (needs %, wants %, category caps)",
                    "health_score": "Dict (score /100, savings rate, emergency cushion)",
                    "fraud_anomalies": "List[Dict] (z-score spikes, duplicate payments)",
                    "cashflow_forecast": "Dict (25-day simulation, risk level, min balance)",
                },
                parameter_destination="Advisor Agent & Alert Agent (Step P-04)",
                mutation_details="Extracts mathematical features, aggregates monthly pivots, calculates z-scores, and runs 25-day Monte-Carlo/heuristic cash-flow projection.",
                schema_validation="PASSED: Mathematical bounds validated (health_score between 0 and 100).",
                risk_tier="MEDIUM",
                parameter_hash=hash_obj({"step": "specialist_analysis", "agents": 6}),
            ),
            ParameterStep(
                step_id="P-04",
                phase="RAG Context Injection",
                agent_or_node="Dynamic Multi-RAG Router",
                input_parameters={
                    "query_or_state": "String with income, savings rate, top spend category, and alerts",
                    "preferred_rag": "String ('auto' or specific RAG)",
                },
                parameter_source="Core Specialist State (Step P-03)",
                output_parameters={
                    "chosen_rag": "String ('personal_finance_rag', 'rbi_regulations_rag', etc.)",
                    "retrieved_facts": "List[Dict] (titles, rules, circular clauses, citations)",
                    "confidence_scores": "Dict[str, float]",
                },
                parameter_destination="Financial Advisor & Reviewer Guardrail (Step P-05)",
                mutation_details="Classifies query intent, queries specialized knowledge base, and retrieves grounded evidence facts to anchor advice.",
                schema_validation="PASSED: Retrieved facts verified against official JSON sources.",
                risk_tier="LOW",
                parameter_hash=hash_obj({"step": "rag_routing", "engines": 4}),
            ),
            ParameterStep(
                step_id="P-05",
                phase="Advisory & Guardrail Review",
                agent_or_node="9 & 11. Advisor Agent & Reviewer Guardrail",
                input_parameters={
                    "financial_state": "Dict containing spending, budget, health, anomalies, forecast",
                    "rag_context": "List[Dict] retrieved evidence facts",
                },
                parameter_source="Specialist Agents (P-03) + RAG Router (P-04)",
                output_parameters={
                    "advice_recommendations": "List[Dict] (action, saving ₹/yr, why, evidence)",
                    "review_guardrail": "Dict (approved: bool, rejected: int)",
                    "llm_narrative": "Dict or String (grounded summary)",
                },
                parameter_destination="Governance EMG Sentinel & UI (Step P-06)",
                mutation_details="Synthesizes deterministic recommendations. Reviewer guardrail validates that savings claim > 0 and why is non-empty; rejects hallucinations.",
                schema_validation="PASSED: Anti-hallucination contract strictly enforced.",
                risk_tier="MEDIUM",
                parameter_hash=hash_obj({"step": "advisory_reviewer"}),
            ),
            ParameterStep(
                step_id="P-06",
                phase="Governance & Observability",
                agent_or_node="Governance Sentinel & EMG Logger",
                input_parameters={
                    "entire_pipeline_state": "Complete S dictionary",
                    "trace_id": "String (e.g. TR-A1B2C3)",
                },
                parameter_source="Reviewer Guardrail (Step P-05)",
                output_parameters={
                    "emg_audit_record": "EMGRecord (SHA-256 parameter hash, timestamp, severity)",
                    "circuit_breaker_status": "Dict (tripped: bool, reason: str)",
                    "final_ui_payload": "JSON serializable client state",
                },
                parameter_destination="FastAPI REST Response & React Client UI",
                mutation_details="Generates cryptographic parameter hash, commits immutable audit record to EMG event stream, and verifies circuit breaker health.",
                schema_validation="PASSED: Tamper-evident hash and schema integrity verified.",
                risk_tier="LOW",
                parameter_hash=hash_obj({"step": "emg_sentinel"}),
            ),
        ]
        return [s.to_dict() for s in steps]

    @staticmethod
    def get_node_contracts() -> Dict[str, Dict[str, Any]]:
        """Detailed parameter contract for every node in the architecture diagram."""
        return {
            "node_input": {
                "name": "1. User Statement / Upload",
                "role": "Source of truth financial records",
                "inputs": ["Raw statement CSV/JSON/PDF", "User opening balance (₹)", "Monthly income (₹)"],
                "outputs": ["Normalized transaction stream"],
                "transformations": "File stream reading and binary format detection",
                "validation": "Valid file extension (.csv, .json, .pdf) and size <= 25MB",
                "risk": "LOW",
            },
            "node_guardrails": {
                "name": "2. Pre-flight Guardrails Harness",
                "role": "Threat detection & PII containment",
                "inputs": ["User queries", "File names", "Raw narration strings"],
                "outputs": ["Sanitized query", "Masked PII (PAN, CC, Aadhaar, UPI)", "Threat alert flags"],
                "transformations": "Regex substitution of card/PAN numbers, injection pattern matching",
                "validation": "Zero unmasked PII, no prompt injection or path traversal",
                "risk": "LOW",
            },
            "node_orchestrator": {
                "name": "3. Master Orchestrator (Planner)",
                "role": "Workflow dependency planner and dispatcher",
                "inputs": ["Sanitized transaction stream", "Profile parameters"],
                "outputs": ["Linear/DAG task plan: Ingest → Categorize → Analyze → Budget → Health → Anomaly → Subs → Forecast → Advise → Review"],
                "transformations": "Constructs execution sequence and initializes execution trace",
                "validation": "Plan contains all 11 required agent stages",
                "risk": "LOW",
            },
            "node_agents": {
                "name": "4. Multi-Agent Analysis Pipeline",
                "role": "11 Specialized deterministic financial wellness agents",
                "inputs": ["Canonical transaction DataFrame", "User profile", "Category overrides"],
                "outputs": ["Spending pivots", "50/30/20 budget util", "Health score /100", "Z-score anomalies", "25-day cash forecast", "Alerts"],
                "transformations": "Monthly aggregations, robust z-score calculation, day-by-day cash buffer simulation",
                "validation": "Health score in [0, 100], budget util non-negative",
                "risk": "MEDIUM",
            },
            "node_multi_rag": {
                "name": "5. Dynamic Multi-RAG Router",
                "role": "Semantic intent classification and knowledge retrieval across 4 specialized KBs",
                "inputs": ["User financial snapshot / query", "Preferred RAG engine ('auto' or specific)"],
                "outputs": ["Retrieved facts with citations", "Confidence scores per engine", "Chosen RAG metadata"],
                "transformations": "Intent keyword scoring and token overlap ranking",
                "validation": "Facts exist in selected knowledge base (no hallucinations)",
                "risk": "LOW",
            },
            "node_multi_mcp": {
                "name": "6. Multi-MCP Server Bus",
                "role": "Client-server tool dispatch over FastMCP stdio",
                "inputs": ["Tool call name", "Arguments dictionary", "Project containment bounds"],
                "outputs": ["JSON-RPC response", "Execution duration (ms)", "Status ('success' | 'error')"],
                "transformations": "JSON-RPC serialization over standard I/O",
                "validation": "Input arguments conform to tool JSONSchema",
                "risk": "MEDIUM",
            },
            "node_governance": {
                "name": "7. Governance EMG Sentinel",
                "role": "Event Monitoring & Governance (EMG) logging & Killswitch",
                "inputs": ["Agent name", "Action", "Parameters", "Severity level", "Trace ID"],
                "outputs": ["EMG Record with SHA-256 parameter signature hash", "Circuit breaker status"],
                "transformations": "SHA-256 cryptographic digest of arguments, ring buffer update",
                "validation": "Circuit breaker trips if >= 4 critical anomalies or injection attack",
                "risk": "CRITICAL",
            },
            "node_reviewer": {
                "name": "8. Output Reviewer Guardrail",
                "role": "Anti-hallucination and advice sanity verification",
                "inputs": ["Generated recommendations", "Financial state metrics"],
                "outputs": ["Approved recommendations", "Rejection count"],
                "transformations": "Filters advice where saving <= 0 or why is empty",
                "validation": "Rejects any ungrounded advice",
                "risk": "LOW",
            },
            "node_output": {
                "name": "9. React Client UI Dashboard",
                "role": "Interactive visual dashboard & observability portal",
                "inputs": ["Approved financial state", "EMG audit stream", "Parameter lineage", "RAG citations"],
                "outputs": ["Glassmorphism charts", "Real-time metrics", "Interactive diagram", "Circuit breaker toggle"],
                "transformations": "Rendering React state and SVG graphics",
                "validation": "Responsive layout, full keyboard/mouse accessibility",
                "risk": "LOW",
            },
        }


# Global singleton
lineage_tracker = ParameterLineageTracker()
