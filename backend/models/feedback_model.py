# models/feedback_model.py
from datetime import datetime

class Feedback:
    """
    Model class for event feedback
    """
    def __init__(self, user_id, event_id, rating, comment=None):
        self.user_id = user_id
        self.event_id = event_id
        self.rating = rating  # 1-5 star rating
        self.comment = comment
        self.created_at = datetime.now()
    
    def to_dict(self):
        """
        Convert feedback object to dictionary for MongoDB storage
        """
        return {
            "user_id": self.user_id,
            "event_id": self.event_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at
        }
    
    @staticmethod
    def from_dict(data):
        """
        Create feedback object from dictionary
        """
        feedback = Feedback(
            user_id=data.get("user_id"),
            event_id=data.get("event_id"),
            rating=data.get("rating"),
            comment=data.get("comment")
        )
        feedback.created_at = data.get("created_at", datetime.now())
        return feedback