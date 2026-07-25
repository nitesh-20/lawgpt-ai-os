from typing import Any


class ResultFormatter:
    """
    Ensures research output matches the requested schema:
    Summary, Detailed Explanation, Applicable Law, Relevant Sections, Related Acts, References, and Confidence Score.
    """

    def format(self, reasoner_out: dict[str, Any], citations: list[dict[str, Any]]) -> dict[str, Any]:
        """
        Formats the reasoner output and citations into the standard UI schema.
        """
        return {
            "summary": reasoner_out.get("summary", ""),
            "key_points": reasoner_out.get("key_points", []),
            "acts": reasoner_out.get("acts", []),
            "sections": reasoner_out.get("sections", []),
            "judgments": reasoner_out.get("judgments", []),
            "compliance_notes": reasoner_out.get("compliance_notes", ""),
            "risk_level": reasoner_out.get("risk_level", "Unknown"),
            "confidence_score": reasoner_out.get("confidence_score", 0.0),
            "citations": reasoner_out.get("citations", []),
            "sources": reasoner_out.get("sources", []),
            "related_documents": reasoner_out.get("related_documents", [])
        }
