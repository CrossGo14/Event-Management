from flask import Blueprint, request, jsonify, send_from_directory
from database import events_collection, users_collection
from bson.objectid import ObjectId
import os
from werkzeug.utils import secure_filename
from flask_cors import cross_origin

event_blueprint = Blueprint("event_routes", __name__)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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
        "attendees": [],  # Empty list initially
        "image_url": data.get("image_url", ""),  # Store image URL with default empty string
        "banner_image": data.get("banner_image", ""),  # Optional banner image
        "gallery_images": data.get("gallery_images", [])  # Optional array of additional images
    }

    event_id = events_collection.insert_one(event).inserted_id
    return jsonify({"message": "Event created successfully", "event_id": str(event_id)}), 201

# Route to fetch all events
@event_blueprint.route("/all", methods=["GET"])
def get_all_events():
    events = list(events_collection.find({}, {
        "_id": 1, 
        "title": 1, 
        "description": 1, 
        "date": 1, 
        "location": 1, 
        "organizer_id": 1,
        "image_url": 1,  # Include image URL in response
        "banner_image": 1,  # Include banner image in response
        "attendees": 1  # Include attendees count
    }))
    
    # Convert ObjectId to string and ensure image URLs are properly formatted
    base_url = request.host_url.rstrip('/')
    for event in events:
        event["_id"] = str(event["_id"])
        
        # Convert relative image paths to absolute URLs
        if event.get("image_url") and not event["image_url"].startswith(('http://', 'https://')):
            event["image_url"] = f"{base_url}/api/events/images/{event['image_url']}"
        
        if event.get("banner_image") and not event["banner_image"].startswith(('http://', 'https://')):
            event["banner_image"] = f"{base_url}/api/events/images/{event['banner_image']}"
        
        print(f"Event data: {event}")  # Debug print
    
    return jsonify(events), 200

# Route to serve uploaded images
# In your get_image route
@event_blueprint.route("/images/<path:filename>", methods=["GET"])
@cross_origin()
def get_image(filename):
    try:
        print(f"Attempting to serve image: {filename}")
        print(f"Upload folder path: {UPLOAD_FOLDER}")
        
        # List files in the upload folder to check if the file exists
        files_in_folder = os.listdir(UPLOAD_FOLDER)
        print(f"Files in upload folder: {files_in_folder}")
        
        # Remove any URL encoding from the filename
        import urllib.parse
        decoded_filename = urllib.parse.unquote(filename)
        print(f"Decoded filename: {decoded_filename}")
        
        # Make the filename secure
        secure_name = secure_filename(decoded_filename)
        print(f"Secure filename: {secure_name}")
        
        # Check if file exists
        file_path = os.path.join(UPLOAD_FOLDER, secure_name)
        print(f"Full file path: {file_path}")
        print(f"File exists: {os.path.exists(file_path)}")
        
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return jsonify({"error": "Image not found"}), 404
        
        # Serve the file
        return send_from_directory(UPLOAD_FOLDER, secure_name)
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return jsonify({"error": str(e)}), 500
    try:
        print(f"Attempting to serve image: {filename}")
        print(f"Upload folder path: {UPLOAD_FOLDER}")
        
        # Remove any URL encoding from the filename
        import urllib.parse
        decoded_filename = urllib.parse.unquote(filename)
        
        # Make the filename secure
        secure_name = secure_filename(decoded_filename)
        
        # Check if file exists
        file_path = os.path.join(UPLOAD_FOLDER, secure_name)
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return jsonify({"error": "Image not found"}), 404
        
        # Serve the file
        return send_from_directory(UPLOAD_FOLDER, secure_name)
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Route to upload images
@event_blueprint.route("/upload-image", methods=["POST"])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        image_url = filename
        return jsonify({"image_url": image_url}), 200

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

# Route to update event images
@event_blueprint.route("/update-images/<event_id>", methods=["PUT"])
def update_event_images(event_id):
    data = request.json
    
    # Check if event exists
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    # Update fields that are provided
    update_data = {}
    if "image_url" in data:
        update_data["image_url"] = data["image_url"]
    if "banner_image" in data:
        update_data["banner_image"] = data["banner_image"]
    if "gallery_images" in data:
        update_data["gallery_images"] = data["gallery_images"]
    
    if not update_data:
        return jsonify({"error": "No image data provided"}), 400
    
    # Update the event
    events_collection.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": update_data}
    )
    
    return jsonify({"message": "Event images updated successfully"}), 200

# Route to get event details including images
@event_blueprint.route("/<event_id>", methods=["GET"])
def get_event_details(event_id):
    try:
        event = events_collection.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Convert ObjectId to string
        event["_id"] = str(event["_id"])
        
        return jsonify(event), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
