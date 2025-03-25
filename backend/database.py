import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env
load_dotenv()

# Get MongoDB URI from .env
mongo_uri = os.getenv("MONGO_URI")

try:
    # Connect to MongoDB
    client = MongoClient(mongo_uri)
    db = client["Eventdb"]

    # Define collections
    users_collection = db["users"]
    events_collection = db["events"]
    registrations_collection = db["registrations"]
    feedbacks_collection = db["feedbacks"]

    print("Connected to MongoDB successfully!")

except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    users_collection = None
    events_collection = None
    registrations_collection = None
    feedbacks_collection = None