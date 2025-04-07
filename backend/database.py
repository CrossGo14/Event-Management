# database.py
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI not found in .env file")

try:
    client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
    db = client["Eventdb"]
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