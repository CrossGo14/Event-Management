from flask import Blueprint, request, jsonify
from database import events_collection

event_blueprint = Blueprint("event_routes", __name__)

# Route to create an event
@event_blueprint.route("/create", methods=["POST"])
def create_event():
    data = request.json
    if not data.get("name") or not data.get("date"):
        return jsonify({"error": "Event name and date are required"}), 400

    event = {
        "name": data["name"],
        "date": data["date"],
        "location": data.get("location", ""),
        "description": data.get("description", "")
    }
    events_collection.insert_one(event)
    return jsonify({"message": "Event created successfully!"}), 201

# Route to get all events
@event_blueprint.route("/all", methods=["GET"])
def get_events():
    events = list(events_collection.find({}, {"_id": 0}))
    return jsonify(events), 200
