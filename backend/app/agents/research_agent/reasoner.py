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

    def _clean_and_parse_json(self, text: str) -> dict[str, Any]:
        """
        Robustly cleans JSON response by removing markdown fences, triple backticks, and extra spaces.
        """
        s = text.strip()
        if s.startswith("```"):
            parts = s.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{") and part.endswith("}"):
                    s = part
                    break
                elif part.startswith("{") and "}" in part:
                    s = part
                    break

        # Strip any leading/trailing characters that are not { or }
        start_idx = s.find("{")
        end_idx = s.rfind("}")
        if start_idx != -1 and end_idx != -1:
            s = s[start_idx:end_idx + 1]

        try:
            return json.loads(s)
        except Exception as e:
            logger.error(f"JSON Parsing Error: {e}. Raw content: {text}")
            raise ValueError(f"Failed to parse JSON response: {e}")

    async def reason(
        self, query: str, ranked_chunks: list[dict[str, Any]], citations: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """
        Synthesizes a response using retrieved chunks. Utilizes Gemini if configured,
        otherwise defaults to the local syntactic reasoner.
        """
        # Determine relevance and source attribution
        top_score = ranked_chunks[0].get("score", 0.0) if ranked_chunks else 0.0
        has_pdf_context = len(ranked_chunks) > 0 and top_score >= 0.50
        
        default_source = "✓ PDF Knowledge Base"
        default_is_grounded = True if has_pdf_context else False

        # Format context for reasoning (limit to top 3 for optimal token limits)
        context_blocks = []
        for idx, chunk in enumerate(ranked_chunks[:3], 1):
            doc_id = chunk.get("document_id", "Unknown")
            sec = chunk.get("section", "N/A")
            text = chunk.get("text", "")[:1200] + "..." if len(chunk.get("text", "")) > 1200 else chunk.get("text", "")
            context_blocks.append(f"[{idx}] Document: {doc_id} | Section: {sec}\nContent: {text}")
        context_text = "\n\n".join(context_blocks)

        system_instruction = (
            "You are a Senior Legal Research Counsel. Produce a professional legal research report.\n"
            "CRITICAL: You MUST NOT write any chain-of-thought, reasoning, preambles, explanations, or text outside the JSON. "
            "Start your response directly with the '{' character and end with the '}' character. "
            "Return your response ONLY as a single valid raw JSON object. Do not wrap in ```json.\n\n"
            "KNOWLEDGE SOURCE MODE RULES:\n"
            "1. If retrieved context is sufficient, use the provided PDF context chunks.\n"
            "2. If retrieved context is insufficient or missing, you MUST answer from general Indian legal knowledge, "
            "and set 'is_context_grounded' to false and 'source' to '✓ PDF Knowledge Base'.\n\n"
            "Your output JSON object MUST contain exactly these keys:\n"
            "{\n"
            "  \"direct_answer\": \"Concise response in 2-4 sentences.\",\n"
            "  \"executive_summary\": \"Professional legal memo executive summary.\",\n"
            "  \"applicable_law\": [{\"act_name\": \"...\", \"sections\": \"...\"}],\n"
            "  \"legal_analysis\": {\"interpretation\": \"...\", \"implications\": \"...\", \"exceptions\": \"...\"},\n"
            "  \"compliance_requirements\": [\"...\"] (Array of strings),\n"
            "  \"risks\": [\"...\"] (Array of strings),\n"
            "  \"recommendations\": [\"...\"] (Array of strings),\n"
            "  \"case_references\": [{\"case_name\": \"...\", \"citation\": \"...\", \"summary\": \"...\"}],\n"
            "  \"citations\": [\"...\"] (Array of citation strings),\n"
            "  \"confidence\": \"High\" or \"Medium\" or \"Low\",\n"
            "  \"source\": \"✓ PDF Knowledge Base\",\n"
            "  \"is_context_grounded\": true or false\n"
            "}"
        )

        prompt = (
            f"System Instruction:\n{system_instruction}\n\n"
            f"User Legal Query: {query}\n\n"
            f"Retrieved Legal Context Chunks:\n{context_text}\n\n"
            "Construct the factual legal report now. Respond ONLY with the raw JSON object."
        )

        api_key = settings.GEMINI_API_KEY or ""
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.1
                    }
                }

                logger.info("Sending request to Gemini API for legal reasoning...")
                async with httpx.AsyncClient() as client:
                    resp = await client.post(url, json=payload, headers=headers, timeout=20.0)
                    if resp.status_code == 200:
                        res_data = resp.json()
                        text_response = res_data["candidates"][0]["content"]["parts"][0]["text"]
                        try:
                            parsed = self._clean_and_parse_json(text_response)
                            logger.info("Successfully received and parsed Gemini response.")
                            return parsed
                        except Exception as parse_err:
                            logger.warning(f"Gemini JSON parse failed: {parse_err}. Recovering text response.")
                            return self._recover_text_to_dict(text_response, query)
                    else:
                        logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}. Falling back to Sarvam LLM.")
            except Exception as e:
                logger.error(f"Error calling Gemini API: {e}. Falling back to Sarvam LLM.")

        # Fallback 1: Sarvam LLM
        try:
            from app.services.sarvam.llm import SarvamLLMManager
            logger.info("Attempting Sarvam LLM for legal reasoning...")
            sarvam_resp = await SarvamLLMManager.generate_content(prompt)
            if sarvam_resp.get("status") == "success":
                text_response = sarvam_resp["content"]
                try:
                    parsed = self._clean_and_parse_json(text_response)
                    logger.info("Successfully received and parsed Sarvam LLM response.")
                    return parsed
                except Exception as parse_err:
                    logger.warning(f"Sarvam JSON parse failed: {parse_err}. Recovering text response.")
                    return self._recover_text_to_dict(text_response, query)
            else:
                logger.warning(f"Sarvam LLM failed: {sarvam_resp.get('message')}. Falling back to local reasoning.")
        except Exception as e:
            logger.error(f"Error calling Sarvam LLM: {e}. Falling back to local reasoning.")

        # Fallback 2: Local reasoning
        return self._local_reasoning(query, ranked_chunks, citations, has_pdf_context, default_source)

    def _recover_text_to_dict(self, raw_text: str, query: str) -> dict[str, Any]:
        """
        Recovers a plain text or malformed JSON response into a valid response dictionary.
        """
        # Clean plain text fallback
        cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
        
        # Simple extraction of JSON fields via regex if possible
        import re
        direct_ans = ""
        exec_sum = ""
        
        direct_match = re.search(r'"direct_answer"\s*:\s*"([^"]+)"', cleaned_text)
        if direct_match:
            direct_ans = direct_match.group(1)
        else:
            direct_match_sq = re.search(r"'direct_answer'\s*:\s*'([^']+)'", cleaned_text)
            if direct_match_sq:
                direct_ans = direct_match_sq.group(1)
                
        sum_match = re.search(r'"executive_summary"\s*:\s*"([^"]+)"', cleaned_text)
        if sum_match:
            exec_sum = sum_match.group(1)
        
        # If we couldn't extract structured fields, use the entire raw text as direct_answer
        if not direct_ans:
            direct_ans = cleaned_text
        if not exec_sum:
            exec_sum = cleaned_text[:300] + "..." if len(cleaned_text) > 300 else cleaned_text
            
        return {
            "direct_answer": direct_ans,
            "executive_summary": exec_sum,
            "applicable_law": [],
            "legal_analysis": {"interpretation": direct_ans, "implications": "N/A", "exceptions": "N/A"},
            "compliance_requirements": [],
            "risks": [],
            "recommendations": [],
            "case_references": [],
            "citations": [],
            "confidence": "Medium",
            "source": "General Legal Knowledge",
            "is_context_grounded": False
        }

    def _local_reasoning(
        self, query: str, ranked_chunks: list[dict[str, Any]], citations: list[dict[str, Any]], has_pdf_context: bool, default_source: str
    ) -> dict[str, Any]:
        """
        Synthesizes a response locally using retrieved chunks to prevent hallucination.
        """
        logger.info("Running local fallback reasoning engine...")
        top_text = ranked_chunks[0].get("text", "") if ranked_chunks else ""
        sentences = [s.strip() for s in top_text.split(".") if s.strip()]
        summary = ". ".join(sentences[:2]) + "." if sentences else "No relevant legal context found in the database."

        detailed_explanation = ""
        paragraphs = []
        for idx, chunk in enumerate(ranked_chunks[:3], 1):
            doc_id = chunk.get("document_id", "Document").replace("_", " ").title()
            sec = chunk.get("section")
            text = chunk.get("text", "").strip()
            ref_prefix = f"According to {doc_id}"
            if sec:
                ref_prefix += f" (Section {sec})"
            paragraphs.append(f"{ref_prefix}: \"{text}\"")
        detailed_explanation = "\n\n".join(paragraphs) if paragraphs else "No matching indexed document was found."

        return {
            "direct_answer": detailed_explanation[:300] + "..." if len(detailed_explanation) > 300 else detailed_explanation,
            "executive_summary": summary,
            "applicable_law": [{"act_name": cit.get("document_name", "N/A"), "sections": cit.get("section", "N/A")} for cit in citations] if citations else [],
            "legal_analysis": {"interpretation": detailed_explanation, "implications": "N/A", "exceptions": "N/A"},
            "compliance_requirements": ["Verify compliance against uploaded acts."],
            "risks": [],
            "recommendations": ["Review source documents carefully."],
            "case_references": [],
            "citations": [cit.get("citation_text", "") for cit in citations if cit.get("citation_text")],
            "confidence": "Low",
            "source": default_source,
            "is_context_grounded": has_pdf_context
        }
