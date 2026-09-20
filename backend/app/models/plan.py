import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text
from app.db.session import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(50), primary_key=True)  # slug: 'free', 'starter', 'business', 'enterprise'
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    monthly_price = Column(Float, default=0.0, nullable=False)
    annual_price = Column(Float, default=0.0, nullable=False)
    max_users = Column(Integer, default=2, nullable=False)
    max_ai_requests = Column(Integer, default=50, nullable=False)
    max_api_requests = Column(Integer, default=500, nullable=False)
    features_json = Column(Text, default="[]", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_popular = Column(Boolean, default=False, nullable=False)
    badge = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    @property
    def features(self) -> List[str]:
        if not self.features_json:
            return []
        try:
            return json.loads(self.features_json)
        except Exception:
            return []

    @features.setter
    def features(self, val: List[str]):
        self.features_json = json.dumps(val or [])
