# routes/feedback_routes.py
from flask import Blueprint, request, jsonify
from database import feedbacks_collection, events_collection, users_collection
from bson.objectid import ObjectId
from models.feedback_model import Feedback
from datetime import datetime
from flask_cors import cross_origin

# Create feedback blueprint
feedback_blueprint = Blueprint("feedback_routes", __name__)

# Health check route
@feedback_blueprint.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Feedback API is running"}), 200

# Route to submit feedback for an event
@feedback_blueprint.route("/submit/<event_id>", methods=["POST"])
@cross_origin()
def submit_feedback(event_id):
    try:
        data = request.json
        user_id = data.get("user_id")
        rating = data.get("rating")
        comment = data.get("comment")
        
        # Validate required fields
        if not user_id or not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({"error": "Invalid feedback data. Rating must be between 1-5."}), 400
        
        # Check if event exists
        event = events_collection.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Check if user attended the event
        if user_id not in event.get("attendees", []):
            return jsonify({"error": "User did not attend this event"}), 403
        
        # Check if user already submitted feedback
        existing_feedback = feedbacks_collection.find_one({"user_id": user_id, "event_id": event_id})
        if existing_feedback:
            return jsonify({"error": "User already submitted feedback for this event"}), 409
        
        # Create feedback object
        feedback = Feedback(user_id, event_id, rating, comment)
        
        # Insert feedback into database
        result = feedbacks_collection.insert_one(feedback.to_dict())
        
        return jsonify({
            "message": "Feedback submitted successfully",
            "feedback_id": str(result.inserted_id)
        }), 201
    
    except Exception as e:
        print(f"Error submitting feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Route to get all feedback for an event
@feedback_blueprint.route("/event/<event_id>", methods=["GET"])
def get_event_feedback(event_id):
    try:
        # Check if event exists
        event = events_collection.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Get all feedback for the event
        feedbacks = list(feedbacks_collection.find({"event_id": event_id}))
        
        # Convert ObjectId to string
        for feedback in feedbacks:
            if "_id" in feedback:
                feedback["_id"] = str(feedback["_id"])
        
        # Calculate average rating
        avg_rating = 0
        if feedbacks:
            avg_rating = sum(feedback.get("rating", 0) for feedback in feedbacks) / len(feedbacks)
        
        return jsonify({
            "feedbacks": feedbacks,
            "count": len(feedbacks),
            "average_rating": round(avg_rating, 1)
        }), 200
    
    except Exception as e:
        print(f"Error getting event feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Route to get user's feedback for an event
@feedback_blueprint.route("/user/<user_id>/event/<event_id>", methods=["GET"])
def get_user_event_feedback(user_id, event_id):
    try:
        # Find user's feedback for the event
        feedback = feedbacks_collection.find_one({"user_id": user_id, "event_id": event_id})
        
        if not feedback:
            return jsonify({"message": "No feedback found"}), 404
        
        # Convert ObjectId to string
        if "_id" in feedback:
            feedback["_id"] = str(feedback["_id"])
        
        return jsonify(feedback), 200
    
    except Exception as e:
        print(f"Error getting user feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Route to get all events a user has attended but not yet provided feedback
@feedback_blueprint.route("/pending/<user_id>", methods=["GET"])
def get_pending_feedback(user_id):
    try:
        # Find all events the user has attended
        attended_events = list(events_collection.find(
            {"attendees": user_id},
            {"_id": 1, "title": 1, "date": 1, "image_url": 1}
        ))
        
        # Convert ObjectId to string and filter past events
        current_date = datetime.now()
        pending_feedback_events = []
        
        for event in attended_events:
            event["_id"] = str(event["_id"])
            event_id = event["_id"]
            
            # Check if event date has passed
            event_date = datetime.fromisoformat(event["date"].replace('Z', '+00:00'))
            if event_date < current_date:
                # Check if user has already submitted feedback
                existing_feedback = feedbacks_collection.find_one({"user_id": user_id, "event_id": event_id})
                if not existing_feedback:
                    pending_feedback_events.append(event)
        
        return jsonify(pending_feedback_events), 200
    
    except Exception as e:
        print(f"Error getting pending feedback events: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500