import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env
load_dotenv()

# Get MongoDB URI from .env
mongo_uri = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["EventDB"]

# Define collections
users_collection = db["users"]
events_collection = db["events"]
registrations_collection = db["registrations"]
feedbacks_collection = db["feedbacks"]

print("Connected to MongoDB successfully!")
