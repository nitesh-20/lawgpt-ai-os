from typing import Any, Dict
from loguru import logger
from app.services.sarvam.client import SarvamClient
from app.services.sarvam.config import SarvamConfig

class DocumentIntelligenceManager:
    """Manages Document Parsing and OCR using Sarvam APIs."""
    
    @classmethod
    async def extract_document(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Uploads document to Sarvam for parsing, OCR, and structure extraction.
        """
        if not SarvamConfig.is_enabled():
            return {"status": "error", "content": "", "message": "Sarvam Document Intelligence is disabled."}
            
        logger.info(f"Sarvam Document: Extracting text from {filename} ({len(file_bytes)} bytes)")
        
        # Sarvam document parse endpoint
        endpoint = "/document/parse" # Hypothetical mapping or similar structure endpoint
        
        files = {
            "file": (filename, file_bytes, "application/pdf")
        }
        
        data = {
            "extract_tables": "true",
            "ocr_enabled": "true"
        }
        
        response = await SarvamClient.post(endpoint, data=data, files=files)
        
        if response.get("status") == "error":
            # If the specific endpoint doesn't exist or we don't have access,
            # we gracefully fail so the caller (RAG indexer) falls back to PyMuPDF.
            return response
            
        # Parse Sarvam Document response
        # Assume it returns 'text' and 'structured_data' (tables/headings)
        extracted_text = response.get("text", "")
        structured_data = response.get("structured_data", {})
        
        return {
            "status": "success",
            "content": extracted_text,
            "structured_data": structured_data,
            "raw_response": response
        }
