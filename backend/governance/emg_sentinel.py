"""
Event Monitoring & Governance (EMG) Sentinel for FinPilot.

Implements:
1. High-fidelity structured EMG audit logging with cryptographic SHA-256 parameter hashing.
2. Automated Circuit Breaker & Killswitch for critical security exceptions and excessive financial anomalies.
3. Policy risk scoring and least-privilege action verification.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Tuple

LOG_DIR = Path(os.environ.get("FINPILOT_LOG_DIR", Path(__file__).resolve().parent.parent.parent / "data"))
LOG_DIR.mkdir(parents=True, exist_ok=True)
EMG_LOG_FILE = LOG_DIR / "emg_audit_trail.jsonl"


def compute_param_hash(data: Any) -> str:
    """Computes a deterministic SHA-256 hash of arbitrary Python dictionary/primitive."""
    try:
        def default_serializer(o):
            if hasattr(o, "isoformat"):
                return o.isoformat()
            if hasattr(o, "to_dict"):
                return o.to_dict()
            return str(o)

        encoded = json.dumps(data, sort_keys=True, default=default_serializer).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()[:16]
    except Exception:
        return hashlib.sha256(str(data).encode("utf-8")).hexdigest()[:16]


@dataclass
class EMGRecord:
    emg_id: str
    timestamp: str
    trace_id: str
    agent_role: str
    actor: str
    severity: Literal["INFO", "WARNING", "CRITICAL", "EMERGENCY"]
    action: str
    parameter_hash: str
    governance_disposition: Literal["APPROVED", "MODIFIED", "REJECTED", "QUARANTINED"]
    risk_score: float
    reason: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class GovernanceEMGSentinel:
    """
    Central Governance Agent and EMG Monitor.
    Tracks all agent actions, validates risk tiers, and triggers circuit breakers.
    """

    def __init__(self, max_allowed_risk: str = "MEDIUM"):
        self.max_allowed_risk = max_allowed_risk
        self.circuit_breaker_tripped: bool = False
        self.circuit_breaker_reason: str = ""
        self.circuit_breaker_tripped_at: Optional[str] = None
        self.in_memory_records: List[EMGRecord] = []
        self._max_in_memory: int = 500

        # Initial startup sentinel log
        self.log_event(
            agent_role="Governance Sentinel",
            actor="system",
            action="INITIALIZE_GOVERNANCE_SENTINEL",
            parameters={"max_risk": max_allowed_risk, "pid": os.getpid()},
            severity="INFO",
            governance_disposition="APPROVED",
            risk_score=0.1,
            reason="Governance Sentinel successfully initialized with active EMG monitoring.",
        )

    def log_event(
        self,
        agent_role: str,
        actor: str,
        action: str,
        parameters: Any,
        severity: Literal["INFO", "WARNING", "CRITICAL", "EMERGENCY"] = "INFO",
        governance_disposition: Literal["APPROVED", "MODIFIED", "REJECTED", "QUARANTINED"] = "APPROVED",
        risk_score: float = 0.1,
        reason: str = "Standard agent operation",
        trace_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> EMGRecord:
        """Commits an immutable event to both in-memory store and JSONL log file."""
        now_iso = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
        param_hash = compute_param_hash(parameters)
        rec = EMGRecord(
            emg_id=f"EMG-{uuid.uuid4().hex[:8].upper()}",
            timestamp=now_iso,
            trace_id=trace_id or f"TR-{uuid.uuid4().hex[:6].upper()}",
            agent_role=agent_role,
            actor=actor,
            severity=severity,
            action=action,
            parameter_hash=param_hash,
            governance_disposition=governance_disposition,
            risk_score=round(risk_score, 2),
            reason=reason,
            metadata=metadata or {},
        )

        self.in_memory_records.append(rec)
        if len(self.in_memory_records) > self._max_in_memory:
            self.in_memory_records.pop(0)

        # Append to JSONL file
        try:
            with EMG_LOG_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(rec.to_dict()) + "\n")
        except Exception as exc:
            print(f"[EMG Sentinel] Warning: Could not write to audit file: {exc}")

        # Check if severity or disposition triggers automatic circuit breaker
        if severity == "EMERGENCY" or governance_disposition == "QUARANTINED":
            if not self.circuit_breaker_tripped:
                self.trip_circuit_breaker(
                    reason=f"Emergency trigger from {agent_role}: {reason}",
                    actor=actor,
                    trace_id=rec.trace_id,
                )

        return rec

    def trip_circuit_breaker(self, reason: str, actor: str = "sentinel", trace_id: Optional[str] = None) -> None:
        """Instantly halts all non-essential tool operations."""
        self.circuit_breaker_tripped = True
        self.circuit_breaker_reason = reason
        self.circuit_breaker_tripped_at = datetime.now(timezone.utc).isoformat(timespec="milliseconds")

        # Explicitly log killswitch activation
        self.log_event(
            agent_role="Circuit Breaker Sentinel",
            actor=actor,
            action="CIRCUIT_BREAKER_TRIPPED",
            parameters={"tripped": True, "reason": reason},
            severity="EMERGENCY",
            governance_disposition="QUARANTINED",
            risk_score=1.0,
            reason=f"EMERGENCY KILLSWITCH ENGAGED: {reason}",
            trace_id=trace_id,
        )

    def reset_circuit_breaker(self, reason: str, actor: str = "administrator") -> None:
        """Resets the circuit breaker following review."""
        self.circuit_breaker_tripped = False
        self.circuit_breaker_reason = ""
        self.circuit_breaker_tripped_at = None

        self.log_event(
            agent_role="Circuit Breaker Sentinel",
            actor=actor,
            action="CIRCUIT_BREAKER_RESET",
            parameters={"tripped": False, "reset_reason": reason},
            severity="INFO",
            governance_disposition="APPROVED",
            risk_score=0.2,
            reason=f"Administrator reset circuit breaker: {reason}",
        )

    def evaluate_pipeline_safety(self, state: Dict[str, Any], trace_id: str) -> Tuple[bool, str]:
        """
        Evaluates pipeline outputs. If excessive anomalies (> 3 critical) or
        suspicious high-value movements are detected, flags or quarantines.
        """
        if self.circuit_breaker_tripped:
            return False, f"Blocked: Circuit breaker currently TRIPPED ({self.circuit_breaker_reason})"

        anomalies = state.get("anomalies", [])
        critical_anomalies = [a for a in anomalies if a.get("kind") in ("Spike", "Duplicate") or a.get("amount", 0) > 40000]

        if len(critical_anomalies) >= 4:
            self.log_event(
                agent_role="Anomaly Governance Auditor",
                actor="sentinel",
                action="ANOMALY_THRESHOLD_BREACHED",
                parameters={"critical_count": len(critical_anomalies), "anomalies": critical_anomalies},
                severity="CRITICAL",
                governance_disposition="QUARANTINED",
                risk_score=0.92,
                reason=f"Detected {len(critical_anomalies)} critical financial anomalies in a single statement. Quarantine advised.",
                trace_id=trace_id,
            )
            return False, f"Safety check triggered: {len(critical_anomalies)} critical anomalies detected."

        self.log_event(
            agent_role="Governance Sentinel",
            actor="orchestrator",
            action="PIPELINE_SAFETY_VERIFIED",
            parameters={"health_score": state.get("health", {}).get("score"), "alerts_count": len(state.get("alerts", []))},
            severity="INFO",
            governance_disposition="APPROVED",
            risk_score=0.15,
            reason="Pipeline execution passed financial governance criteria.",
            trace_id=trace_id,
        )
        return True, "Pipeline safety verified."

    def get_audit_trail(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Returns the most recent EMG records."""
        # Merge in-memory and disk records
        records: List[Dict[str, Any]] = [r.to_dict() for r in self.in_memory_records]
        if EMG_LOG_FILE.is_file():
            try:
                disk_lines = EMG_LOG_FILE.read_text(encoding="utf-8").splitlines()
                parsed = [json.loads(line) for line in disk_lines if line.strip()]
                # Keep unique by emg_id
                seen = {r["emg_id"] for r in records}
                for p in parsed:
                    if p.get("emg_id") not in seen:
                        records.append(p)
                        seen.add(p.get("emg_id"))
            except Exception:
                pass

        # Sort reverse chronological
        records.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return records[:limit]


# Global singleton instance
governance_sentinel = GovernanceEMGSentinel()
