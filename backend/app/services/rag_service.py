import logging
from typing import List, Optional
import numpy as np
from sqlalchemy.orm import Session
from app.core.database import IS_POSTGRES
from app.models.knowledge import KnowledgeChunk
from app.schemas.advisor import KnowledgeReference
from app.data.seed_datasets import generate_deterministic_embedding

logger = logging.getLogger("kisanos.rag")


class RAGService:
    def __init__(self):
        self.embedding_dim = 1536

    def generate_embedding(self, text: str) -> List[float]:
        """Generates embedding for incoming query using deterministic embedding generator."""
        return generate_deterministic_embedding(text, dim=self.embedding_dim)

    def retrieve_relevant_chunks(
        self,
        db: Session,
        query: str,
        crop: Optional[str] = None,
        top_k: int = 3
    ) -> List[KnowledgeChunk]:
        """
        Retrieves top_k relevant agricultural knowledge chunks using vector similarity.
        Prioritizes crop-specific and topic-matched chunks.
        Uses native pgvector <=> operator on PostgreSQL, or in-memory vector ranking on SQLite fallback.
        """
        query_vector = self.generate_embedding(query)

        # 1. PostgreSQL with pgvector (production path)
        if IS_POSTGRES:
            try:
                query_obj = db.query(KnowledgeChunk)
                if crop:
                    query_obj = query_obj.filter(KnowledgeChunk.crop.ilike(f"%{crop}%"))
                chunks = (
                    query_obj.order_by(KnowledgeChunk.embedding.cosine_distance(query_vector))
                    .limit(top_k)
                    .all()
                )
                if chunks:
                    return chunks
            except Exception as e:
                logger.warning(f"PostgreSQL pgvector query fell back to application-layer calculation: {e}")

        # 2. Application-layer Fallback (SQLite development fallback or fallback on error)
        query_obj = db.query(KnowledgeChunk)
        if crop:
            clean_crop = crop.split()[0].replace("(", "").replace(")", "").strip()
            crop_matched = query_obj.filter(KnowledgeChunk.crop.ilike(f"%{clean_crop}%")).all()
            if crop_matched:
                all_chunks = crop_matched
            else:
                all_chunks = db.query(KnowledgeChunk).all()
        else:
            all_chunks = db.query(KnowledgeChunk).all()

        if not all_chunks:
            return []

        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            return all_chunks[:top_k]

        scored_chunks = []
        for chunk in all_chunks:
            if chunk.embedding:
                c_vec = np.array(chunk.embedding, dtype=np.float32)
                c_norm = np.linalg.norm(c_vec)
                sim = np.dot(q_vec, c_vec) / (q_norm * c_norm) if c_norm > 0 else 0.0

                # Keyword relevance bonus for exact topic/crop matches
                q_lower = query.lower()
                if chunk.topic.lower() in q_lower or any(word in chunk.content.lower() for word in q_lower.split() if len(word) > 3):
                    sim += 0.15

                scored_chunks.append((sim, chunk))
            else:
                scored_chunks.append((0.0, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_chunks[:top_k]]

    def to_knowledge_references(self, chunks: List[KnowledgeChunk]) -> List[KnowledgeReference]:
        """Converts KnowledgeChunk model instances to structured KnowledgeReference schemas."""
        refs: List[KnowledgeReference] = []
        for c in chunks:
            snippet = c.content[:160] + "..." if len(c.content) > 160 else c.content
            refs.append(KnowledgeReference(
                id=c.id,
                title=c.topic,
                category=c.crop,
                source_document=c.source_document,
                content_snippet=snippet
            ))
        return refs


rag_service = RAGService()
