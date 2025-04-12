from flask import Blueprint, request, jsonify, send_from_directory
from database import events_collection, users_collection
from bson.objectid import ObjectId
import os
from werkzeug.utils import secure_filename
from flask_cors import cross_origin
import stripe
import urllib.parse
from dotenv import load_dotenv
import traceback
import json

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
        "attendee_count": 0,  # Initialize attendee count
        "image_url": data.get("image_url", ""),  # Store image URL with default empty string
        "banner_image": data.get("banner_image", ""),  # Optional banner image
        "gallery_images": data.get("gallery_images", []),  # Optional array of additional images
        "payment_sessions": []  # Track processed payment sessions
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
        "attendees": 1,
        "attendee_count": 1  # Include attendee count
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
        "attendees": 1,
        "attendee_count": 1
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
@event_blueprint.route("/create-payment", methods=["POST"])
@cross_origin()
def create_payment():
    try:
        data = request.json
        event_id = data.get('eventId')
        price = data.get('price', 10)
        title = data.get('title', 'Event Registration')
        user_id = data.get('userId')
        
        if not event_id:
            return jsonify({"error": "Event ID is required"}), 400
            
        if user_id:
            event = events_collection.find_one({"_id": ObjectId(event_id)})
            if event and 'attendees' in event and user_id in event['attendees']:
                return jsonify({"error": "You are already registered for this event"}), 400
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'Registration for {title}',
                        },
                        'unit_amount': int(price * 100),
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f'http://localhost:5173/payment-success?payment_status=success&session_id={{CHECKOUT_SESSION_ID}}&event_id={event_id}&user_id={user_id}',
            cancel_url=f'http://localhost:5173/events?payment_status=cancel&event_id={event_id}',
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

        try:
            object_id = ObjectId(event_id)
        except:
            return jsonify({'error': 'Invalid event ID format'}), 400

        event = events_collection.find_one({'_id': object_id})
        if not event:
            return jsonify({'error': 'Event not found'}), 404
            
        if 'attendees' not in event:
            events_collection.update_one(
                {'_id': object_id},
                {'$set': {'attendees': [], 'attendee_count': 0, 'payment_sessions': []}}
            )
            event = events_collection.find_one({'_id': object_id})
            
        if user_id in event.get('attendees', []):
            return jsonify({
                'message': 'User already registered',
                'attendees': len(event.get('attendees', [])),
                'attendee_count': event.get('attendee_count', len(event.get('attendees', [])))
            }), 200

        if session_id and session_id in event.get('payment_sessions', []):
            return jsonify({
                'message': 'Payment already processed',
                'attendees': len(event.get('attendees', [])),
                'attendee_count': event.get('attendee_count', len(event.get('attendees', [])))
            }), 200

        update_data = {
            '$addToSet': {'attendees': user_id},
            '$inc': {'attendee_count': 1}
        }
        if session_id:
            if 'payment_sessions' not in event:
                update_data['$set'] = {'payment_sessions': [session_id]}
            else:
                update_data['$addToSet']['payment_sessions'] = session_id
            
        result = events_collection.update_one({'_id': object_id}, update_data)
        
        if result.modified_count > 0 or result.matched_count > 0:
            updated_event = events_collection.find_one({'_id': object_id})
            updated_attendees = updated_event.get('attendees', [])
            return jsonify({
                'message': 'Attendee count updated',
                'attendees': len(updated_attendees),
                'attendee_count': updated_event.get('attendee_count', len(updated_attendees))
            }), 200
        else:
            return jsonify({'error': 'Failed to update attendees'}), 500
    except Exception as e:
        traceback.print_exc()
        print(f"Error updating attendees: {str(e)}")
        return jsonify({'error': str(e)}), 500
    

# Stripe webhook handler
@event_blueprint.route('/webhook', methods=['POST'])
def stripe_webhook():
    print("Webhook received - Raw data:", request.get_data(as_text=True))  # Log raw payload
    print("Headers:", dict(request.headers))  # Log all headers
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    try:
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            print("Verified webhook event:", event['type'])
        else:
            event = json.loads(payload)
            print("Unverified webhook event (no secret):", event['type'])
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            event_id = session.get('metadata', {}).get('event_id')
            user_id = session.get('metadata', {}).get('user_id')
            session_id = session.get('id')
            print(f"Processing payment: event_id={event_id}, user_id={user_id}, session_id={session_id}")
            
            if event_id and user_id:
                try:
                    object_id = ObjectId(event_id)
                except:
                    print("Invalid event_id format:", event_id)
                    return jsonify({'error': 'Invalid event ID format'}), 400

                event = events_collection.find_one({'_id': object_id})
                if not event:
                    print("Event not found for id:", event_id)
                    return jsonify({'error': 'Event not found'}), 404

                if user_id in event.get('attendees', []):
                    print("User already registered:", user_id)
                    return jsonify({'status': 'success'}), 200

                if session_id and session_id in event.get('payment_sessions', []):
                    print("Session already processed:", session_id)
                    return jsonify({'status': 'success'}), 200

                update_data = {
                    '$addToSet': {'attendees': user_id, 'payment_sessions': session_id},
                    '$inc': {'attendee_count': 1}
                }
                result = events_collection.update_one({'_id': object_id}, update_data)
                print(f"Update result: modified={result.modified_count}, matched={result.matched_count}")
                if result.modified_count == 0:
                    print("No update applied, event doc:", events_collection.find_one({'_id': object_id}))

        return jsonify({'status': 'success'}), 200
    except ValueError as e:
        print("Invalid payload error:", str(e))
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        print("Signature verification failed:", str(e))
        return jsonify({'error': 'Invalid signature'}), 400
    except Exception as e:
        print("Webhook error:", str(e))
        return jsonify({'error': str(e)}), 500
    

@event_blueprint.route('/<event_id>/comments', methods=['GET'])
@cross_origin()
def get_event_comments(event_id):
    try:
        # Convert string ID to ObjectId
        event_oid = ObjectId(event_id)
        
        # Find the event
        event = events_collection.find_one({'_id': event_oid})
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        # Get comments from the event or return empty list if none
        comments = event.get('comments', [])
        
        # Sort comments by created_at timestamp (newest first)
        comments.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({'comments': comments}), 200
    
    except Exception as e:
        print(f"Error fetching comments: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add a new comment to an event
@event_blueprint.route('/<event_id>/comments', methods=['POST'])
@cross_origin()
def add_event_comment(event_id):
    try:
        # Convert string ID to ObjectId
        event_oid = ObjectId(event_id)
        
        # Get comment data from request
        data = request.json
        if not data or 'text' not in data or not data['text'].strip():
            return jsonify({'error': 'Comment text is required'}), 400
        
        # Create comment object with a unique ID
        from datetime import datetime
        comment = {
            '_id': str(ObjectId()),  # Generate a unique ID for the comment
            'user_id': data.get('user_id', 'anonymous'),
            'username': data.get('username', 'Anonymous'),
            'text': data['text'].strip(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Update the event with the new comment
        # If 'comments' field doesn't exist yet, it will be created
        result = events_collection.update_one(
            {'_id': event_oid}, 
            {'$push': {'comments': comment}}
        )
        
        if result.modified_count == 0:
            # Check if the event exists but no modification was made
            event = events_collection.find_one({'_id': event_oid})
            if not event:
                return jsonify({'error': 'Event not found'}), 404
        
        return jsonify({'message': 'Comment added successfully', 'comment': comment}), 201
    
    except Exception as e:
        print(f"Error adding comment: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Optional: Delete a comment
@event_blueprint.route('/<event_id>/comments/<comment_id>', methods=['DELETE'])
@cross_origin()
def delete_event_comment(event_id, comment_id):
    try:
        # Convert string ID to ObjectId
        event_oid = ObjectId(event_id)
        
        # Check if user has permission (you may want to implement this)
        # For now we'll allow any deletion
        
        # Update the event by removing the comment with the given ID
        result = events_collection.update_one(
            {'_id': event_oid},
            {'$pull': {'comments': {'_id': comment_id}}}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Event or comment not found'}), 404
        
        return jsonify({'message': 'Comment deleted successfully'}), 200
    
    except Exception as e:
        print(f"Error deleting comment: {str(e)}")
        return jsonify({'error': str(e)}), 500