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
        # Ensure we fallback cleanly if keys are missing
        summary = reasoner_out.get("summary", reasoner_out.get("Summary", ""))
        detailed_explanation = reasoner_out.get(
            "detailed_explanation", reasoner_out.get("Detailed Explanation", "")
        )
        applicable_law = reasoner_out.get("applicable_law", reasoner_out.get("Applicable Law", ""))
        relevant_sections = reasoner_out.get(
            "relevant_sections", reasoner_out.get("Relevant Sections", [])
        )
        related_acts = reasoner_out.get("related_acts", reasoner_out.get("Related Acts", []))
        references = reasoner_out.get("references", reasoner_out.get("References", []))
        confidence_score = reasoner_out.get(
            "confidence_score", reasoner_out.get("Confidence Score", 0.0)
        )

        return {
            "Summary": summary,
            "Detailed Explanation": detailed_explanation,
            "Applicable Law": applicable_law,
            "Relevant Sections": relevant_sections,
            "Related Acts": related_acts,
            "References": references,
            "Confidence Score": confidence_score,
            "citations": citations,
        }
