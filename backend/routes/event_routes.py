from flask import Blueprint, request, jsonify
from database import events_collection, users_collection
from bson.objectid import ObjectId

event_blueprint = Blueprint("event_routes", __name__)

# Route to create an event
@event_blueprint.route("/create", methods=["POST"])
def create_event():
    data = request.json

    required_fields = ["title", "description", "date", "location", "organizer_id"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    event = {
        "title": data["title"],
        "description": data["description"],
        "date": data["date"],
        "location": data["location"],
        "organizer_id": data["organizer_id"],  # Clerk user ID
        "attendees": []  # Empty list initially
    }

    event_id = events_collection.insert_one(event).inserted_id
    return jsonify({"message": "Event created successfully", "event_id": str(event_id)}), 201

# Route to fetch all events
@event_blueprint.route("/all", methods=["GET"])
def get_all_events():
    events = list(events_collection.find({}, {"_id": 1, "title": 1, "description": 1, "date": 1, "location": 1, "organizer_id": 1}))
    for event in events:
        event["_id"] = str(event["_id"])  # Convert ObjectId to string
    return jsonify(events), 200

# Route to register for an event
@event_blueprint.route("/register/<event_id>", methods=["POST"])
def register_for_event(event_id):
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"error": "Event not found"}), 404

    if user_id in event["attendees"]:
        return jsonify({"message": "User already registered"}), 200

    # Add user to attendees list
    events_collection.update_one({"_id": ObjectId(event_id)}, {"$push": {"attendees": user_id}})
    return jsonify({"message": "User registered successfully"}), 200
