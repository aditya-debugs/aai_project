"""
Multi-RAG Knowledge Bases for FinPilot.
Loads and indexes 4 distinct knowledge bases:
1. Personal Finance Knowledge Base (50/30/20, emergency cushion, debt ratios)
2. RBI Banking & Digital Payment Regulations (zero liability, tokenization, UPI caps)
3. Income Tax Regimes & Slabs (Old vs New regime, 80C, 80D, standard deduction)
4. National Spending & Savings Benchmarks (household percentages, income tiers)
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DOCS_DIR = BASE_DIR / "docs"
PUBLIC_DATA_DIR = BASE_DIR / "backend" / "public_data"


def tokenize(text: str) -> List[str]:
    clean = re.sub(r"[^a-zA-Z0-9\s]", " ", str(text).lower())
    return [w for w in clean.split() if len(w) > 2]


class RAGEngine:
    def __init__(self, name: str, display_name: str, description: str, category: str, color: str):
        self.name = name
        self.display_name = display_name
        self.description = description
        self.category = category
        self.color = color
        self.documents: List[Dict[str, Any]] = []

    def add_document(self, title: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        self.documents.append({
            "title": title,
            "content": content,
            "metadata": metadata or {},
            "tokens": set(tokenize(f"{title} {content}")),
        })

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = set(tokenize(query))
        if not query_tokens:
            return self.documents[:top_k]

        scored = []
        for doc in self.documents:
            overlap = len(query_tokens.intersection(doc["tokens"]))
            # Bonus for exact query phrase in text
            phrase_bonus = 1.0 if query.lower() in (doc["title"] + " " + doc["content"]).lower() else 0.0
            score = overlap + phrase_bonus
            scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, doc in scored[:top_k]:
            results.append({
                "title": doc["title"],
                "content": doc["content"],
                "metadata": doc["metadata"],
                "relevance_score": round(score, 2),
                "source_engine": self.name,
            })
        return results


class MultiRAGRegistry:
    def __init__(self):
        self.engines: Dict[str, RAGEngine] = {}
        self._load_all()

    def _load_all(self):
        # 1. Personal Finance RAG
        pf_rag = RAGEngine(
            name="personal_finance_rag",
            display_name="Personal Finance & Advisory RAG",
            description="50/30/20 budgeting rules, debt caps, savings metrics, and proactive wellness guidance.",
            category="Financial Planning",
            color="#3b82f6",  # Blue
        )
        kb_path = DOCS_DIR / "financial_kb.json"
        if kb_path.is_file():
            try:
                items = json.loads(kb_path.read_text(encoding="utf-8"))
                for item in items:
                    pf_rag.add_document(
                        title=item.get("title", "Guideline"),
                        content=item.get("content", ""),
                        metadata={"type": "standard_rule"},
                    )
            except Exception:
                pass
        self.engines[pf_rag.name] = pf_rag

        # 2. RBI Regulations RAG
        rbi_rag = RAGEngine(
            name="rbi_regulations_rag",
            display_name="RBI Regulatory & Compliance RAG",
            description="Official Reserve Bank of India circulars on unauthorized transaction liabilities, UPI caps, and consumer rights.",
            category="Banking Regulations",
            color="#10b981",  # Emerald
        )
        rbi_path = PUBLIC_DATA_DIR / "rbi_regulations.json"
        if rbi_path.is_file():
            try:
                items = json.loads(rbi_path.read_text(encoding="utf-8"))
                for item in items:
                    content = f"{item.get('summary', '')} Key Clauses: {' | '.join(item.get('key_clauses', []))}"
                    rbi_rag.add_document(
                        title=f"{item.get('circular_id')}: {item.get('title')}",
                        content=content,
                        metadata={"authority": item.get("authority"), "date": item.get("date"), "channels": item.get("applicable_channels")},
                    )
            except Exception:
                pass
        self.engines[rbi_rag.name] = rbi_rag

        # 3. Tax Regimes RAG
        tax_rag = RAGEngine(
            name="tax_regimes_rag",
            display_name="Income Tax Regimes & Deductions RAG",
            description="Comparison of New vs Old Tax Regimes, slabs, Section 87A rebate, standard deduction, and 80C/80D optimization.",
            category="Tax Optimization",
            color="#8b5cf6",  # Purple
        )
        tax_path = PUBLIC_DATA_DIR / "tax_regimes.json"
        if tax_path.is_file():
            try:
                tax_data = json.loads(tax_path.read_text(encoding="utf-8"))
                new_slabs = ", ".join(f"{s['range']} @ {s['rate_percent']}%" for s in tax_data.get("new_regime_slabs", []))
                tax_rag.add_document(
                    title="New Tax Regime Slabs (Section 115BAC)",
                    content=f"Tax Slabs: {new_slabs}. Rebate u/s 87A: Zero tax up to ₹7,00,000 (effective ₹7,75,000 with ₹75k standard deduction).",
                    metadata={"year": tax_data.get("financial_year")},
                )
                old_slabs = ", ".join(f"{s['range']} @ {s['rate_percent']}%" for s in tax_data.get("old_regime_slabs", []))
                tax_rag.add_document(
                    title="Old Tax Regime Slabs & Itemized Deductions",
                    content=f"Tax Slabs: {old_slabs}. Allows ₹1.5L u/s 80C, ₹25k-₹75k u/s 80D health insurance, ₹2L u/s 24b home loan interest, and HRA exemption.",
                    metadata={"year": tax_data.get("financial_year")},
                )
                tax_rag.add_document(
                    title="Tax Regime Selection Decision Rule",
                    content=tax_data.get("decision_rule_for_advisor_agent", ""),
                    metadata={"type": "rule"},
                )
            except Exception:
                pass
        self.engines[tax_rag.name] = tax_rag

        # 4. Market & Spending Benchmarks RAG
        bm_rag = RAGEngine(
            name="market_benchmarks_rag",
            display_name="Household Spending & Peer Benchmarks RAG",
            description="Indian household spending distribution benchmarks across income tiers, debt risk thresholds, and category ratios.",
            category="Market Intelligence",
            color="#f59e0b",  # Amber
        )
        bm_path = PUBLIC_DATA_DIR / "spending_benchmarks.json"
        if bm_path.is_file():
            try:
                bm_data = json.loads(bm_path.read_text(encoding="utf-8"))
                for tier_key, tier_info in bm_data.get("household_spending_distribution_by_income_tier", {}).items():
                    top_cats = ", ".join(f"{c['category']}: {c['share_percent']}%" for c in tier_info.get("top_categories", []))
                    bm_rag.add_document(
                        title=f"Benchmark: {tier_info.get('income_bracket')}",
                        content=f"Ideal distribution: Needs {tier_info.get('needs_percent')}%, Wants {tier_info.get('wants_percent')}%, Savings {tier_info.get('savings_percent')}%. Median cushion: {tier_info.get('median_emergency_cushion_months')} months. Top spends: {top_cats}.",
                        metadata={"tier": tier_key},
                    )
                thresh = bm_data.get("health_risk_thresholds", {})
                bm_rag.add_document(
                    title="Financial Health Risk Thresholds",
                    content=f"Max debt-to-income: {thresh.get('max_sustainable_debt_to_income'):.0%}. Recommended emergency fund: {thresh.get('recommended_emergency_months_salaried')} months for salaried individuals. Minimum savings rate: {thresh.get('ideal_savings_rate_minimum'):.0%}.",
                    metadata={"type": "thresholds"},
                )
            except Exception:
                pass
        self.engines[bm_rag.name] = bm_rag

    def get_engine(self, name: str) -> Optional[RAGEngine]:
        return self.engines.get(name)

    def list_engines(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": e.name,
                "display_name": e.display_name,
                "description": e.description,
                "category": e.category,
                "color": e.color,
                "document_count": len(e.documents),
            }
            for e in self.engines.values()
        ]


# Singleton instance
rag_registry = MultiRAGRegistry()
