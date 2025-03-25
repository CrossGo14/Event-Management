import os
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

# MongoDB Connection
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(mongo_uri)
db = client.get_database('Eventdb')
users_collection = db.users

# Create a unique index on clerk_id to prevent duplicates
users_collection.create_index('clerk_id', unique=True)

# Create authentication blueprint
auth_blueprint = Blueprint("auth", __name__)

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