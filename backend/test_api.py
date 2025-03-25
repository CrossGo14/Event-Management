import requests

BASE_URL = "http://127.0.0.1:5000/events"

# Create an event
event_data = {
    "title": "Tech Meetup",
    "description": "A networking event for developers",
    "date": "2025-04-01",
    "location": "Mumbai",
    "organizer_id": "clerk_user_id_here"
}
response = requests.post(f"{BASE_URL}/create", json=event_data)
print("Create Event:", response.json())

# Get all events
response = requests.get(f"{BASE_URL}/all")
print("All Events:", response.json())

# Register for an event
event_id = "65f2d1e8a2b4a73d8e3b4b12"  # Replace with actual event ID
registration_data = {"user_id": "clerk_user_id_here"}
response = requests.post(f"{BASE_URL}/register/{event_id}", json=registration_data)
print("Register for Event:", response.json())
