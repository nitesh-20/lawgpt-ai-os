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
            "answer": reasoner_out.get("answer", ""),
            "executive_summary": reasoner_out.get("executive_summary", ""),
            "key_points": reasoner_out.get("key_points", []),
            "acts": reasoner_out.get("acts", []),
            "sections": reasoner_out.get("sections", []),
            "recommendations": reasoner_out.get("recommendations", []),
            "citations": reasoner_out.get("citations", []),
            "related_documents": reasoner_out.get("related_documents", []),
            "confidence_score": reasoner_out.get("confidence_score", 0.0),
        }
