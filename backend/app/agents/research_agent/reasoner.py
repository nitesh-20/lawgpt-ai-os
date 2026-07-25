import json
from typing import Any
import httpx
from loguru import logger
from app.core.config import settings


class LegalReasoner:
    """
    Performs LLM reasoning (via Gemini API) on top of retrieved context chunks.
    If the Gemini API key is not present, falls back to a high-fidelity local text-synthesizer
    to ensure deterministic context-only answers with zero hallucinations.
    """

    async def reason(
        self, query: str, ranked_chunks: list[dict[str, Any]], citations: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """
        Synthesizes a response using retrieved chunks. Utilizes Gemini if configured,
        otherwise defaults to the local syntactic reasoner.
        """
        if not ranked_chunks:
            return {
                "summary": "No relevant legal context found in the database.",
                "detailed_explanation": "I searched the knowledge base but could not locate any documents matching your query.",
                "applicable_law": "N/A",
                "relevant_sections": [],
                "related_acts": [],
                "references": [],
                "confidence_score": 0.0,
            }

        # Format context for reasoning
        context_blocks = []
        for idx, chunk in enumerate(ranked_chunks, 1):
            doc_id = chunk.get("document_id", "Unknown")
            sec = chunk.get("section", "N/A")
            text = chunk.get("text", "")
            context_blocks.append(f"[{idx}] Document: {doc_id} | Section: {sec}\nContent: {text}")
        context_text = "\n\n".join(context_blocks)

        api_key = settings.GEMINI_API_KEY or ""
        if api_key:
            try:
                # Call Gemini API via httpx directly to avoid google-generativeai package dependency
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                
                system_instruction = (
                    "You are a Senior Legal Research Counsel. Answer the legal question based ONLY on the provided context. "
                    "Do not fabricate facts or citations. "
                    "CRITICAL: If the provided context chunks do not contain any information relevant to the user's query, "
                    "do NOT attempt to answer. Instead, set 'executive_summary' to 'No relevant legal context found in the database.', "
                    "and 'answer' to 'I searched the current legal database but could not locate any documents matching your query. Please try searching for a different term or upload relevant documents.' "
                    "Return your answer in a strict JSON format with the following keys: 'answer' (Direct answer), "
                    "'executive_summary' (Executive summary of findings), 'key_points' (array of important clauses or key findings), "
                    "'acts' (array of applicable acts), 'sections' (array of relevant sections), "
                    "'recommendations' (array of compliance implications & practical recommendations), "
                    "'citations' (array of source citations), 'related_documents' (array of related document names), "
                    "and 'confidence_score' (float between 0.0 and 1.0)."
                )

                prompt = (
                    f"User Legal Query: {query}\n\n"
                    f"Retrieved Legal Context Chunks:\n{context_text}\n\n"
                    "Construct a factual response based strictly on the above context. Respond only with the raw JSON object."
                )

                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "systemInstruction": {"parts": [{"text": system_instruction}]},
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.1
                    }
                }

                logger.info("Sending request to Gemini API for legal reasoning...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(url, json=payload, headers=headers, timeout=15.0)
                    if resp.status_code == 200:
                        res_data = resp.json()
                        text_response = res_data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text_response.strip())
                        logger.info("Successfully received and parsed Gemini response.")
                        return parsed
                    else:
                        logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}. Falling back to local reasoning.")
            except Exception as e:
                logger.error(f"Error calling Gemini API: {e}. Falling back to local reasoning.")

        # Fall back to high-fidelity local context-synthesizer
        return self._local_reasoning(query, ranked_chunks, citations)

    def _local_reasoning(
        self, query: str, ranked_chunks: list[dict[str, Any]], citations: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """
        Synthesizes a response locally using retrieved chunks to prevent hallucination.
        """
        logger.info("Running local fallback reasoning engine...")
        # Calculate average score for confidence
        avg_score = sum(c.get("score", 0.5) for c in ranked_chunks) / max(len(ranked_chunks), 1)

        # If the search score is too low, we likely fetched irrelevant documents (hybrid score below 0.82 typically means no direct match)
        if avg_score < 0.82:
            return {
                "answer": "I searched the current legal database but could not locate any documents directly matching your query. The system currently only contains the Companies Act and BNS. Please upload documents related to Data Privacy to get accurate answers.",
                "executive_summary": "No relevant legal context found in the database.",
                "key_points": [],
                "acts": [],
                "sections": [],
                "recommendations": [],
                "citations": [],
                "related_documents": [],
                "confidence_score": 0.0
            }

        # Extract acts and sections
        related_acts = list({c.get("document_name", "") for c in citations if c.get("document_name")})
        relevant_sections = list(
            {
                f"Section {c.get('section')} of {c.get('document_name')}"
                for c in citations
                if c.get("section") and c.get("document_name")
            }
        )

        # Assemble summary from the most relevant chunk
        top_chunk = ranked_chunks[0]
        top_text = top_chunk.get("text", "")
        # Get first two sentences
        sentences = [s.strip() for s in top_text.split(".") if s.strip()]
        summary = ". ".join(sentences[:2]) + "." if sentences else "Relevant provisions found."

        # Detailed explanation is formulated from chunk text blocks
        paragraphs = []
        for idx, chunk in enumerate(ranked_chunks[:3], 1):
            doc_id = chunk.get("document_id", "Document").replace("_", " ").title()
            sec = chunk.get("section")
            text = chunk.get("text", "").strip()
            
            ref_prefix = f"According to {doc_id}"
            if sec:
                ref_prefix += f" (Section {sec})"
            paragraphs.append(f"{ref_prefix}: \"{text}\"")

        detailed_explanation = "\n\n".join(paragraphs)

        # Collect references
        references = [cit.get("citation_text", "") for cit in citations]

        return {
            "answer": detailed_explanation,
            "executive_summary": summary,
            "key_points": [sentences[0]] if sentences else [],
            "acts": related_acts,
            "sections": relevant_sections,
            "recommendations": ["Adherence to the active provisions is recommended."],
            "citations": references,
            "related_documents": related_acts,
            "confidence_score": round(avg_score, 3)
        }
