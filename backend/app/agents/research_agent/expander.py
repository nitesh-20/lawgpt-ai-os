import re
from typing import Any


class QueryExpander:
    """
    Recognizes and expands abbreviations (e.g., IPC -> Indian Penal Code, BNS, DPDP, GST, IT Act)
    and extracts structured legal references (sections, articles).
    """

    ABBREVIATIONS = {
        r"\bipc\b": "Indian Penal Code",
        r"\bbns\b": "Bharatiya Nyaya Sanhita",
        r"\bdpdp\b": "Digital Personal Data Protection Act",
        r"\bgst\b": "Goods and Services Tax",
        r"\bit act\b": "Information Technology Act",
        r"\bcrpc\b": "Code of Criminal Procedure",
        r"\bcpc\b": "Code of Civil Procedure",
        r"\bconstitution\b": "Constitution of India",
        r"\biea\b": "Indian Evidence Act",
        r"\bbsa\b": "Bharatiya Sakshya Adhiniyam",
    }

    def expand(self, query: str) -> dict[str, Any]:
        if not query:
            return {
                "expanded_query": "",
                "detected_acts": [],
                "detected_sections": [],
                "detected_articles": [],
            }

        expanded = query
        detected_acts = []

        # Expand abbreviations
        for pattern, full_name in self.ABBREVIATIONS.items():
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                # Replace pattern in expanded query
                expanded = re.sub(pattern, f"{full_name} ({match.group()})", expanded, flags=re.IGNORECASE)
                detected_acts.append(full_name)

        # Extract sections, e.g., "Section 302", "sec. 420", "s. 9"
        sections = re.findall(
            r"(?:section|sec\.?|s\.?)\s+(\d+[a-zA-Z]?)", query, re.IGNORECASE
        )
        # Extract articles, e.g., "Article 21", "art. 14"
        articles = re.findall(
            r"(?:article|art\.?)\s+(\d+[a-zA-Z]?)", query, re.IGNORECASE
        )

        # Clean duplicates
        detected_sections = list(set(sections))
        detected_articles = list(set(articles))

        # Append expansions to query text to maximize match in vector store search
        expanded_query = expanded
        if detected_acts:
            expanded_query += " " + " ".join(detected_acts)

        return {
            "expanded_query": expanded_query.strip(),
            "detected_acts": list(set(detected_acts)),
            "detected_sections": detected_sections,
            "detected_articles": detected_articles,
        }
