# routes/auth_routes.py
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from database import users_collection  # Import from database.py
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timezone

# Create authentication blueprint
auth_blueprint = Blueprint("auth", __name__)

# Defer index creation until runtime
def initialize_indexes():
    if users_collection is not None:
        users_collection.create_index('clerk_id', unique=True)
        print("Created unique index on 'clerk_id'")
    else:
        raise RuntimeError("users_collection is not initialized")

# Call initialize_indexes when the blueprint is registered (handled in app.py)
initialize_indexes()  # Temporary for testing, move to app.py later

@auth_blueprint.route("/store-user", methods=["POST"])
@cross_origin()
def store_user():
    try:
        # Extract user data from the request
        user_data = request.json
        
        # Verify required fields
        clerk_id = user_data.get('clerk_id')
        email = user_data.get('email')
        
        if not clerk_id or not email:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Prepare user document
        user_document = {
            'clerk_id': clerk_id,
            'email': email,
            'username': user_data.get('username'),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'profile_image_url': user_data.get('profile_image_url'),
            'created_at': datetime.now(timezone.utc),
            'last_login': datetime.now(timezone.utc)
        }
        
        # Try to insert or update user
        try:
            # Attempt to insert
            result = users_collection.insert_one(user_document)
            return jsonify({
                "message": "User added to database successfully",
                "user_id": str(result.inserted_id),
                "clerk_id": clerk_id
            }), 201
        
        except DuplicateKeyError:
            # If user exists, find and return existing user
            existing_user = users_collection.find_one({'clerk_id': clerk_id})
            return jsonify({
                "message": "User already exists",
                "user_id": str(existing_user['_id']),
                "clerk_id": clerk_id
            }), 409
    
    except Exception as e:
        print(f"Error in user sync: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500