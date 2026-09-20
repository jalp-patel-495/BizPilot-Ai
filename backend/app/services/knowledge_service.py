import re
import json
import logging
from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.knowledge_item import KnowledgeItem
from app.models.conversation import Conversation
from app.models.chat_message import ChatMessage

logger = logging.getLogger("upteky.knowledge_service")

# Keywords that explicitly indicate the user desires a human agent
HANDOFF_TRIGGERS = [
    "human",
    "real person",
    "agent",
    "representative",
    "operator",
    "talk to someone",
    "speak to someone",
    "support person",
    "live agent",
    "customer care",
    "specialist",
    "escalate",
    "human support",
]


class KnowledgeService:
    """
    Intelligent Grounding & Confidence Engine for Upteky AI Customer Support.
    Ensures zero hallucination by strictly grounding answers in verified business knowledge.
    """

    def is_handoff_requested(self, query: str) -> bool:
        """Detect whether the user is explicitly requesting a human agent."""
        query_lower = query.lower()
        for trigger in HANDOFF_TRIGGERS:
            # Word boundary matching
            if re.search(rf"\b{re.escape(trigger)}\b", query_lower):
                return True
        return False

    def search_knowledge(
        self, db: Session, org_id: str, query: str, limit: int = 3
    ) -> List[Tuple[KnowledgeItem, float]]:
        """
        Rank active knowledge base entries based on token relevance, title, keywords, and content.
        Returns a list of tuples (KnowledgeItem, score_between_0_and_1).
        """
        # Fetch active items for the organization
        items = db.query(KnowledgeItem).filter(
            KnowledgeItem.organization_id == org_id,
            KnowledgeItem.is_active == True,
        ).all()

        if not items:
            return []

        # Tokenize query, remove short punctuation/stop tokens
        raw_tokens = re.findall(r"\w+", query.lower())
        stop_words = {"the", "a", "an", "is", "are", "what", "how", "do", "you", "we", "our", "to", "for", "in", "of", "and", "or", "can", "please", "tell", "me", "about"}
        tokens = [t for t in raw_tokens if len(t) > 2 and t not in stop_words]

        if not tokens:
            tokens = raw_tokens

        scored_items = []
        for item in items:
            score = 0.0
            title_lower = item.title.lower()
            content_lower = item.content.lower()
            keywords_lower = (item.keywords or "").lower()
            category_lower = item.category.lower()

            # Exact phrase or title boost
            if query.lower() in title_lower or title_lower in query.lower():
                score += 0.85

            matched_tokens = 0
            for t in tokens:
                token_matched = False
                if t in title_lower:
                    score += 0.40
                    token_matched = True
                if t in keywords_lower:
                    score += 0.35
                    token_matched = True
                if t in category_lower:
                    score += 0.20
                    token_matched = True
                if t in content_lower:
                    score += 0.15
                    token_matched = True

                if token_matched:
                    matched_tokens += 1

            # Proportion of query tokens satisfied
            if tokens:
                coverage_ratio = matched_tokens / len(tokens)
                score *= (0.5 + 0.5 * coverage_ratio)

            # Normalize roughly to 0.0 - 1.0 max
            final_score = min(1.0, score)
            if final_score > 0.15:
                scored_items.append((item, round(final_score, 2)))

        # Sort descending by score
        scored_items.sort(key=lambda x: x[1], reverse=True)
        return scored_items[:limit]

    def answer_query(
        self, db: Session, org_id: str, query: str
    ) -> Dict[str, Any]:
        """
        Evaluate customer query, score confidence against the Knowledge Base,
        and generate a grounded response or anti-hallucination fallback.
        """
        # 1. Check for explicit human handoff request
        if self.is_handoff_requested(query):
            return {
                "message": (
                    "Certainly! I am escalating your conversation to our human support team right away. "
                    "A support specialist has been alerted and will join this thread. "
                    "If you need immediate assistance, you can also reach our emergency support desk at +1 (800) 555-0199."
                ),
                "confidence": 1.0,
                "sources": [],
                "needs_handoff": True,
                "handoff_offered": True,
                "status": "HANDOFF_REQUESTED",
            }

        # 2. Search Knowledge Base
        ranked_matches = self.search_knowledge(db, org_id, query, limit=3)

        # 3. Confidence evaluation: if no match or top score < 0.45, reject hallucination
        CONFIDENCE_THRESHOLD = 0.45
        if not ranked_matches or ranked_matches[0][1] < CONFIDENCE_THRESHOLD:
            return {
                "message": (
                    "I apologize, but I do not have sufficient verified information in our knowledge base "
                    "to answer your question accurately. Rather than guessing or providing inaccurate details, "
                    "I can connect you directly with a human support specialist. Would you like me to hand this off to our team?"
                ),
                "confidence": round(ranked_matches[0][1] if ranked_matches else 0.25, 2),
                "sources": [],
                "needs_handoff": True,
                "handoff_offered": True,
                "status": "ACTIVE",
            }

        # 4. Synthesize Grounded Answer from matched articles
        top_item, top_score = ranked_matches[0]
        sources = [
            {
                "id": str(item.id),
                "title": item.title,
                "category": item.category,
            }
            for item, score in ranked_matches
            if score >= CONFIDENCE_THRESHOLD
        ]

        # Structure natural, high-confidence response based on category
        content_snippet = top_item.content.strip()
        confidence = min(0.98, max(0.85, top_score))

        if top_item.category == "faq":
            response_text = f"{content_snippet}"
        elif top_item.category == "policy":
            response_text = f"According to our official {top_item.title}:\n\n{content_snippet}"
        elif top_item.category == "product":
            response_text = f"Regarding {top_item.title}:\n\n{content_snippet}"
        elif top_item.category == "service":
            response_text = f"For our {top_item.title} services:\n\n{content_snippet}"
        elif top_item.category == "contact":
            response_text = f"Here is our verified contact information:\n\n{content_snippet}"
        else:
            response_text = f"Based on our company records for {top_item.title}:\n\n{content_snippet}"

        # If there is a complementary secondary match, append context
        if len(ranked_matches) > 1 and ranked_matches[1][1] >= 0.55:
            sec_item = ranked_matches[1][0]
            if sec_item.category != top_item.category:
                response_text += f"\n\nAdditionally, regarding {sec_item.title}: {sec_item.content.strip()}"

        return {
            "message": response_text,
            "confidence": round(confidence, 2),
            "sources": sources,
            "needs_handoff": False,
            "handoff_offered": False,
            "status": "ACTIVE",
        }


knowledge_service = KnowledgeService()
