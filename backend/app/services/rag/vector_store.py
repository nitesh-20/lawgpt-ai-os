import os
import json
from pathlib import Path
from typing import Any
from loguru import logger
from app.database.firestore import get_firestore_client


class BaseVectorStore:
    """
    Abstract interface for pluggable vector store engines.
    """
    async def insert_chunk(self, chunk_data: dict[str, Any]) -> None:
        raise NotImplementedError

    async def get_chunks_by_document(self, doc_id: str) -> list[dict[str, Any]]:
        raise NotImplementedError

    async def delete_chunks_by_document(self, doc_id: str) -> None:
        raise NotImplementedError


class FirestoreVectorStore(BaseVectorStore):
    """
    Stores vector chunks and metadata in Google Cloud Firestore,
    falling back to local storage if Firestore connection is not initialized.
    """
    def __init__(self) -> None:
        self.collection_name = "knowledge_chunks"
        self.local_fallback = Path("/Users/niteshsahu/Desktop/lawgpt-ai-os/backend/data/local_vector_store.json")

    def _get_client(self):
        try:
            return get_firestore_client()
        except Exception:
            return None

    async def insert_chunk(self, chunk_data: dict[str, Any]) -> None:
        client = self._get_client()
        chunk_id = chunk_data["chunk_id"]

        if client is not None:
            logger.info(f"Indexing chunk {chunk_id} to Firestore collection: {self.collection_name}")
            try:
                doc_ref = client.collection(self.collection_name).document(chunk_id)
                doc_ref.set(chunk_data)
                return
            except Exception as e:
                logger.warning(f"Firestore write failed: {e}. Falling back to local storage.")

        # Local JSON Fallback
        self._write_local_chunk(chunk_data)

    def _write_local_chunk(self, chunk_data: dict[str, Any]) -> None:
        logger.info(f"Indexing chunk {chunk_data['chunk_id']} to Local JSON Fallback Vector Store.")
        try:
            data = []
            if self.local_fallback.exists():
                with open(self.local_fallback, "r") as f:
                    data = json.load(f)
            data = [item for item in data if item["chunk_id"] != chunk_data["chunk_id"]]
            data.append(chunk_data)
            with open(self.local_fallback, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to write to local vector store fallback: {e}")

    async def get_chunks_by_document(self, doc_id: str) -> list[dict[str, Any]]:
        client = self._get_client()
        if client is not None:
            try:
                docs = client.collection(self.collection_name).where("document_id", "==", doc_id).stream()
                chunks: list[dict[str, Any]] = []
                for d in docs:
                    doc_data = d.to_dict()
                    if doc_data is not None:
                        chunks.append(doc_data)
                return chunks
            except Exception as e:
                logger.warning(f"Firestore query failed: {e}. Checking local storage.")

        # Local JSON Fallback
        if self.local_fallback.exists():
            with open(self.local_fallback, "r") as f:
                data = json.load(f)
            return [item for item in data if item.get("document_id") == doc_id]
        return []

    async def delete_chunks_by_document(self, doc_id: str) -> None:
        client = self._get_client()
        if client is not None:
            try:
                docs = client.collection(self.collection_name).where("document_id", "==", doc_id).stream()
                for d in docs:
                    d.reference.delete()
                logger.info(f"Deleted Firestore chunks for document: {doc_id}")
                return
            except Exception as e:
                logger.warning(f"Firestore delete failed: {e}. Falling back to local.")

        # Local JSON Fallback
        if self.local_fallback.exists():
            with open(self.local_fallback, "r") as f:
                data = json.load(f)
            data = [item for item in data if item.get("document_id") != doc_id]
            with open(self.local_fallback, "w") as f:
                json.dump(data, f, indent=2)


class FAISSVectorStore(BaseVectorStore):
    """
    FAISS vector store provider stub.
    """
    async def insert_chunk(self, chunk_data: dict[str, Any]) -> None:
        logger.info(f"FAISS: Inserted chunk {chunk_data['chunk_id']}")

    async def get_chunks_by_document(self, doc_id: str) -> list[dict[str, Any]]:
        return []

    async def delete_chunks_by_document(self, doc_id: str) -> None:
        logger.info(f"FAISS: Deleted chunks for {doc_id}")


class ChromaVectorStore(BaseVectorStore):
    """
    Chroma DB vector store provider stub.
    """
    async def insert_chunk(self, chunk_data: dict[str, Any]) -> None:
        logger.info(f"Chroma: Inserted chunk {chunk_data['chunk_id']}")

    async def get_chunks_by_document(self, doc_id: str) -> list[dict[str, Any]]:
        return []

    async def delete_chunks_by_document(self, doc_id: str) -> None:
        logger.info(f"Chroma: Deleted chunks for {doc_id}")


class PineconeVectorStore(BaseVectorStore):
    """
    Pinecone DB vector store provider stub.
    """
    async def insert_chunk(self, chunk_data: dict[str, Any]) -> None:
        logger.info(f"Pinecone: Inserted chunk {chunk_data['chunk_id']}")

    async def get_chunks_by_document(self, doc_id: str) -> list[dict[str, Any]]:
        return []

    async def delete_chunks_by_document(self, doc_id: str) -> None:
        logger.info(f"Pinecone: Deleted chunks for {doc_id}")


class WeaviateVectorStore(BaseVectorStore):
    """
    Weaviate DB vector store provider stub.
    """
    async def insert_chunk(self, chunk_data: dict[str, Any]) -> None:
        logger.info(f"Weaviate: Inserted chunk {chunk_data['chunk_id']}")

    async def get_chunks_by_document(self, doc_id: str) -> list[dict[str, Any]]:
        return []

    async def delete_chunks_by_document(self, doc_id: str) -> None:
        logger.info(f"Weaviate: Deleted chunks for {doc_id}")


def get_vector_store(provider_name: str | None = None) -> BaseVectorStore:
    provider = provider_name or os.getenv("VECTOR_STORE_PROVIDER") or "firestore"
    name = provider.lower()
    if name == "firestore":
        return FirestoreVectorStore()
    elif name == "faiss":
        return FAISSVectorStore()
    elif name == "chroma":
        return ChromaVectorStore()
    elif name == "pinecone":
        return PineconeVectorStore()
    elif name == "weaviate":
        return WeaviateVectorStore()
    else:
        logger.warning(f"Unknown vector store provider: {name}. Defaulting to Firestore.")
        return FirestoreVectorStore()
