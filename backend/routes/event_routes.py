from flask import Blueprint, request, jsonify, send_from_directory
from database import events_collection, users_collection
from bson.objectid import ObjectId
import os
from werkzeug.utils import secure_filename
from flask_cors import cross_origin
import stripe
import urllib.parse
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# Create blueprint
event_blueprint = Blueprint("event_routes", __name__)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Set Stripe API key from environment variable with fallback
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_51R8jhnJoj9GjRK6iewTSQnPbjUbdz7Pxuu9tofTAKGk0P0RkafUUUPBTLiyxMGLzU0GQOh4Nd8ljRbmzx7PLBXuk00LIp7hTsQ")
print(f"Stripe API key set to: {stripe.api_key[:8]}...")  # Debug key

# Health check route
@event_blueprint.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running"}), 200

# Route to create an event
@event_blueprint.route("/create", methods=["POST"])
@cross_origin()
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
    
    base_url = request.host_url.rstrip('/')
    for event in events:
        event["_id"] = str(event["_id"])
        if event.get("image_url") and not event["image_url"].startswith(('http://', 'https://')):
            event["image_url"] = f"{base_url}/api/events/images/{event['image_url']}"
        if event.get("banner_image") and not event["banner_image"].startswith(('http://', 'https://')):
            event["banner_image"] = f"{base_url}/api/events/images/{event['banner_image']}"
    
    return jsonify(events), 200

# Route to fetch user's events
@event_blueprint.route("/my-events/<user_id>", methods=["GET"])
def get_user_events(user_id):
    events = list(events_collection.find({"organizer_id": user_id}, {
        "_id": 1, 
        "title": 1, 
        "description": 1, 
        "date": 1, 
        "location": 1, 
        "organizer_id": 1,
        "image_url": 1,
        "banner_image": 1,
        "attendees": 1
    }))
    
    base_url = request.host_url.rstrip('/')
    for event in events:
        event["_id"] = str(event["_id"])
        if event.get("image_url") and not event["image_url"].startswith(('http://', 'https://')):
            event["image_url"] = f"{base_url}/api/events/images/{event['image_url']}"
        if event.get("banner_image") and not event["banner_image"].startswith(('http://', 'https://')):
            event["banner_image"] = f"{base_url}/api/events/images/{event['banner_image']}"
    
    return jsonify(events), 200

# Route to serve uploaded images
@event_blueprint.route("/images/<path:filename>", methods=["GET"])
@cross_origin()
def get_image(filename):
    try:
        decoded_filename = urllib.parse.unquote(filename)
        secure_name = secure_filename(decoded_filename)
        file_path = os.path.join(UPLOAD_FOLDER, secure_name)
        if not os.path.exists(file_path):
            return jsonify({"error": "Image not found"}), 404
        return send_from_directory(UPLOAD_FOLDER, secure_name)
    except Exception as e:
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

    events_collection.update_one({"_id": ObjectId(event_id)}, {"$push": {"attendees": user_id}})
    return jsonify({"message": "User registered successfully"}), 200

# Route to update event images
@event_blueprint.route("/update-images/<event_id>", methods=["PUT"])
def update_event_images(event_id):
    data = request.json
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    update_data = {}
    if "image_url" in data:
        update_data["image_url"] = data["image_url"]
    if "banner_image" in data:
        update_data["banner_image"] = data["banner_image"]
    if "gallery_images" in data:
        update_data["gallery_images"] = data["gallery_images"]
    
    if not update_data:
        return jsonify({"error": "No image data provided"}), 400
    
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
        event["_id"] = str(event["_id"])
        return jsonify(event), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to create a payment session
import stripe
from flask import request, jsonify, redirect, url_for

# Set your Stripe API key - replace with your actual key
stripe.api_key = "sk_test_51R8jhnJoj9GjRK6iewTSQnPbjUbdz7Pxuu9tofTAKGk0P0RkafUUUPBTLiyxMGLzU0GQOh4Nd8ljRbmzx7PLBXuk00LIp7hTsQ"

@event_blueprint.route("/create-payment", methods=["POST"])
@cross_origin()
def create_payment():
    try:
        data = request.json
        event_id = data.get('eventId')
        price = data.get('price', 10)  # Default to $10 if not specified
        title = data.get('title', 'Event Registration')
        user_id = data.get('userId')  # Get user ID
        
        if not event_id:
            return jsonify({"error": "Event ID is required"}), 400
            
        # Check if user is already registered for this event
        if user_id:
            event = events_collection.find_one({"_id": ObjectId(event_id)})
            if event and 'attendees' in event and user_id in event['attendees']:
                return jsonify({"error": "You are already registered for this event"}), 400
        
        # Create a Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'Registration for {title}',
                        },
                        'unit_amount': int(price * 100),  # Stripe uses cents
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f'http://localhost:5173/registered-events?payment_status=success&session_id={{CHECKOUT_SESSION_ID}}&event_id={event_id}',
            cancel_url=f'http://localhost:5173/registered-events?payment_status=cancel&event_id={event_id}',
            metadata={
                'event_id': event_id,
                'user_id': user_id
            }
        )
        
        return jsonify({'id': checkout_session.id})
    except Exception as e:
        print(f"Error creating payment session: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Fix the update-attendees endpoint
@event_blueprint.route('/update-attendees/<event_id>', methods=['POST'])
@cross_origin()
def update_attendees(event_id):
    print(f"Received update-attendees request for event_id: {event_id}")
    try:
        data = request.json
        user_id = data.get("user_id")
        session_id = data.get("session_id")
        print(f"Received user_id: {user_id}, session_id: {session_id}")
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Check if event exists
        event = events_collection.find_one({'_id': ObjectId(event_id)})
        if not event:
            return jsonify({'error': 'Event not found'}), 404
            
        # Initialize attendees array if it doesn't exist
        if 'attendees' not in event:
            events_collection.update_one(
                {'_id': ObjectId(event_id)},
                {'$set': {'attendees': [], 'payment_sessions': []}}
            )
            
        # Check if user is already registered
        if user_id in event.get('attendees', []):
            return jsonify({
                'error': 'User already registered',
                'attendees': len(event.get('attendees', []))
            }), 400

        # Check if this payment session was already processed
        if session_id and 'payment_sessions' in event and session_id in event.get('payment_sessions', []):
            return jsonify({
                'error': 'Payment already processed',
                'attendees': len(event.get('attendees', []))
            }), 400

        # Add user to attendees and track payment session
        update_data = {'$addToSet': {'attendees': user_id}}
        
        # If session_id is provided, add it to payment_sessions
        if session_id:
            update_data['$addToSet']['payment_sessions'] = session_id
            
        updated_event = events_collection.find_one_and_update(
            {'_id': ObjectId(event_id)},
            update_data,  # Use addToSet to avoid duplicates
            return_document=True
        )
        
        if updated_event:
            print(f"Updated attendees: {updated_event.get('attendees', [])}")
            return jsonify({
                'message': 'Attendee count updated',
                'attendees': len(updated_event.get('attendees', []))
            }), 200
        else:
            print(f"Event not found for id: {event_id}")
            return jsonify({'error': 'Event not found'}), 404
    except Exception as e:
        print(f"Error updating attendees: {str(e)}")
        return jsonify({'error': str(e)}), 500