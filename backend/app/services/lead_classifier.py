from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional


class LeadClassifierService:
    """
    Automatic Lead Classification Service.
    Classifies business leads into 'HOT', 'WARM', or 'COLD'
    based on configurable business rules and heuristic scoring.
    """

    def __init__(self):
        # Default configurable rule thresholds
        self.rules = {
            "hot_deal_value_min": 20000.0,
            "hot_ai_score_min": 85.0,
            "hot_fast_track_statuses": ["QUALIFIED", "PROPOSAL", "NEGOTIATION"],
            "hot_fast_track_deal_min": 10000.0,
            "hot_high_intent_sources": ["Referral", "Partner", "Inbound Demo"],
            "warm_deal_value_min": 5000.0,
            "warm_ai_score_min": 55.0,
            "warm_statuses": ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION"],
            "follow_up_window_days": 7,
        }

    def get_rules(self) -> Dict[str, Any]:
        """Return currently active classification rules and thresholds."""
        return self.rules

    def update_rules(self, new_rules: Dict[str, Any]) -> Dict[str, Any]:
        """Update configurable classification thresholds."""
        for key, val in new_rules.items():
            if key in self.rules:
                self.rules[key] = val
        return self.rules

    def classify_lead(
        self,
        deal_value: float,
        status: str,
        source: Optional[str] = None,
        ai_score: Optional[float] = None,
        follow_up_date: Optional[datetime] = None,
        notes: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, str]:
        """
        Evaluate business parameters against configurable rules and return classification & reason.
        Returns: { 'classification': 'HOT' | 'WARM' | 'COLD', 'reason': str }
        """
        status_upper = (status or "NEW").upper()
        source_name = source or "Website"
        score = ai_score if ai_score is not None else 70.0
        val = deal_value or 0.0

        # Rule 1: Explicit Lost is always Cold
        if status_upper == "LOST":
            return {
                "classification": "COLD",
                "reason": "Opportunity marked as Lost.",
            }

        # Rule 2: Explicit Converted is handled as Won/Closed
        if status_upper == "CONVERTED":
            return {
                "classification": "HOT",
                "reason": "Deal successfully closed and converted.",
            }

        # Check for HOT criteria
        if val >= self.rules["hot_deal_value_min"]:
            return {
                "classification": "HOT",
                "reason": f"High ARR opportunity (Rs. {val:,.0f} >= Rs. {self.rules['hot_deal_value_min']:,.0f}).",
            }

        if status_upper in self.rules["hot_fast_track_statuses"] and val >= self.rules["hot_fast_track_deal_min"]:
            return {
                "classification": "HOT",
                "reason": f"Advanced pipeline stage ({status_upper}) with deal value Rs. {val:,.0f}.",
            }

        if any(s.lower() in source_name.lower() for s in self.rules["hot_high_intent_sources"]) and score >= 75.0:
            return {
                "classification": "HOT",
                "reason": f"High-intent acquisition channel ('{source_name}') with strong AI score ({score:.0f}/100).",
            }

        if score >= self.rules["hot_ai_score_min"]:
            return {
                "classification": "HOT",
                "reason": f"Exceptional ML conversion probability score ({score:.1f}/100).",
            }

        # Check for WARM criteria
        has_imminent_follow_up = False
        if follow_up_date:
            now = datetime.now(timezone.utc)
            # Ensure timezone compatibility
            f_date = follow_up_date if follow_up_date.tzinfo else follow_up_date.replace(tzinfo=timezone.utc)
            if now <= f_date <= now + timedelta(days=self.rules["follow_up_window_days"]):
                has_imminent_follow_up = True

        if has_imminent_follow_up:
            return {
                "classification": "WARM",
                "reason": f"Scheduled follow-up engagement within {self.rules['follow_up_window_days']} days.",
            }

        if val >= self.rules["warm_deal_value_min"] or score >= self.rules["warm_ai_score_min"]:
            return {
                "classification": "WARM",
                "reason": f"Solid engagement profile with Rs. {val:,.0f} deal value and {score:.0f} AI score.",
            }

        if status_upper in self.rules["warm_statuses"]:
            return {
                "classification": "WARM",
                "reason": f"Active lifecycle stage: {status_upper}.",
            }

        # Default fallback to COLD
        return {
            "classification": "COLD",
            "reason": f"Low velocity deal (Rs. {val:,.0f}) with no imminent follow-up outreach.",
        }


lead_classifier = LeadClassifierService()
