import re
from typing import Dict, Any, List

class SentimentAnalysisService:
    """
    NLP sentiment categorization, topic extraction, and urgent escalation detection.
    Can be used standalone or augmented with Gemini LLM.
    """

    POSITIVE_WORDS = {
        "great", "excellent", "amazing", "wonderful", "friendly", "professional",
        "fast", "clean", "best", "love", "awesome", "prompt", "helpful", "perfect",
        "recommend", "superb", "outstanding", "impressed", "fantastic", "quality"
    }

    NEGATIVE_WORDS = {
        "bad", "terrible", "awful", "horrible", "rude", "slow", "dirty", "worst",
        "scam", "rip-off", "unprofessional", "delayed", "expensive", "hate",
        "disappointed", "poor", "never", "mistake", "broken", "useless", "waste"
    }

    ESCALATION_KEYWORDS = {
        "lawyer", "attorney", "sue", "legal", "lawsuit", "refund", "scam",
        "fraud", "poisoning", "police", "court", "better business bureau",
        "danger", "injury", "threat", "chargeback", "stole", "unacceptable"
    }

    TOPIC_DICTIONARY = {
        "customer_service": ["service", "staff", "manager", "support", "reception", "team", "personnel", "waiter", "host"],
        "pricing_value": ["price", "cost", "expensive", "cheap", "value", "bill", "charge", "quote", "fee", "money"],
        "speed_timeliness": ["fast", "slow", "wait", "delay", "time", "hour", "minute", "schedule", "punctual"],
        "quality_work": ["quality", "clean", "dirty", "repair", "fix", "delicious", "fresh", "job", "work", "result"],
        "communication": ["call", "phone", "email", "answer", "response", "message", "contact", "update"]
    }

    @classmethod
    def analyze_review(cls, text: str, rating: float) -> Dict[str, Any]:
        if not text:
            sentiment = "positive" if rating >= 4.0 else ("neutral" if rating >= 3.0 else "negative")
            score = 0.5 if rating >= 4.0 else (0.0 if rating >= 3.0 else -0.5)
            return {
                "sentiment": sentiment,
                "sentiment_score": score,
                "topics": [],
                "is_escalated": False
            }

        lower_text = text.lower()
        words = set(re.findall(r'\b[a-z]{3,}\b', lower_text))

        pos_matches = words.intersection(cls.POSITIVE_WORDS)
        neg_matches = words.intersection(cls.NEGATIVE_WORDS)
        escalation_matches = [k for k in cls.ESCALATION_KEYWORDS if k in lower_text]

        # Calculate sentiment score (-1.0 to 1.0)
        # Factor both textual keywords and user star rating
        text_score = (len(pos_matches) - len(neg_matches)) / max(1, len(pos_matches) + len(neg_matches))
        rating_normalized = (rating - 3.0) / 2.0  # maps 1->-1.0, 3->0.0, 5->1.0
        composite_score = round((text_score * 0.5) + (rating_normalized * 0.5), 2)

        if composite_score >= 0.20:
            sentiment = "positive"
        elif composite_score <= -0.20:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        # Topic Extraction
        identified_topics = []
        for topic, keywords in cls.TOPIC_DICTIONARY.items():
            if any(k in lower_text for k in keywords):
                identified_topics.append(topic.replace("_", " ").title())

        is_escalated = len(escalation_matches) > 0 or (rating == 1.0 and sentiment == "negative")

        return {
            "sentiment": sentiment,
            "sentiment_score": composite_score,
            "topics": identified_topics[:3] or ["General Experience"],
            "is_escalated": is_escalated
        }
