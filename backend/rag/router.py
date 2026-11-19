"""
Dynamic Multi-RAG Query Router for FinPilot.
Intelligently classifies incoming user queries or financial contexts and selects
the optimal specialized RAG engine (or combines them in hybrid mode).
"""
from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple

from .knowledge_bases import rag_registry, tokenize


INTENT_KEYWORDS: Dict[str, List[str]] = {
    "rbi_regulations_rag": [
        "rbi", "regulation", "circular", "liability", "fraud", "unauthorized",
        "upi", "mpin", "chargeback", "tokenisation", "tokenization", "card",
        "stolen", "dispute", "npci", "scam", "breach", "refund", "penal"
    ],
    "tax_regimes_rag": [
        "tax", "regime", "slab", "slabs", "80c", "80d", "87a", "deduction",
        "deductions", "income tax", "exemption", "exemptions", "new regime",
        "old regime", "salary", "standard deduction", "hra", "24b", "nps"
    ],
    "market_benchmarks_rag": [
        "benchmark", "benchmarks", "average", "peer", "peers", "tier", "household",
        "national", "median", "comparison", "compare", "distribution", "lifestyle",
        "affluent", "middle class", "survey", "city", "typical"
    ],
    "personal_finance_rag": [
        "budget", "budgeting", "50/30/20", "emergency fund", "cushion", "savings",
        "savings rate", "debt", "emi", "subscription", "subscriptions", "netflix",
        "anomaly", "spending", "food", "dining", "swiggy", "zomato", "groceries"
    ]
}


class DynamicRAGRouter:
    """Classifies user intent and routes queries to specialized RAG engines."""

    def __init__(self):
        self.registry = rag_registry

    def classify_and_route(
        self,
        query: str,
        preferred_rag: Optional[str] = None,
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """
        Classifies query intent and queries the selected RAG engine.
        If preferred_rag is 'auto' or None, automatically routes based on highest confidence.
        """
        query_clean = query.lower()
        query_tokens = set(tokenize(query_clean))

        # Calculate confidence score for each RAG engine
        scores: Dict[str, float] = {}
        for rag_name, keywords in INTENT_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw in query_clean)
            token_matches = len(query_tokens.intersection(set(keywords)))
            raw_score = (matches * 1.5) + (token_matches * 1.0)
            scores[rag_name] = round(raw_score, 2)

        # Normalize scores to 0.0 - 1.0 confidence
        max_score = max(scores.values()) if scores and max(scores.values()) > 0 else 1.0
        confidence_map: Dict[str, float] = {
            k: round(min(1.0, v / (max_score + 1.0)), 2) for k, v in scores.items()
        }

        # Determine chosen RAG
        if preferred_rag and preferred_rag != "auto" and preferred_rag in self.registry.engines:
            chosen_rag = preferred_rag
            routing_reason = f"Manual override: user selected '{chosen_rag}'."
        else:
            # Pick highest score, defaulting to personal_finance_rag
            sorted_rags = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            if sorted_rags and sorted_rags[0][1] > 0.5:
                chosen_rag = sorted_rags[0][0]
                routing_reason = f"Auto-routed to '{chosen_rag}' based on keyword alignment (confidence: {confidence_map[chosen_rag] * 100:.0f}%)."
            else:
                chosen_rag = "personal_finance_rag"
                routing_reason = "Defaulted to 'personal_finance_rag' for general financial wellness."

        # Fetch facts from selected engine
        engine = self.registry.get_engine(chosen_rag)
        facts = engine.search(query, top_k=top_k) if engine else []

        return {
            "query": query,
            "chosen_rag": chosen_rag,
            "chosen_rag_name": engine.display_name if engine else chosen_rag,
            "routing_reason": routing_reason,
            "confidence_scores": confidence_map,
            "facts": facts,
            "total_facts": len(facts),
        }


# Global singleton
rag_router = DynamicRAGRouter()
