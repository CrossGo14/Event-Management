import requests

BASE_URL = "http://127.0.0.1:5000/api/events"

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

# Test image upload
def test_image_upload():
    try:
        # Replace with path to an actual test image on your system
        image_path = r"C:\Users\Aditya\Desktop\Webx\Event-Management\test_image.jpg"
        
        with open(image_path, 'rb') as img:
            files = {'file': img}
            response = requests.post(f"{BASE_URL}/upload-image", files=files)
        
        print("Image Upload:", response.json())
        return response.json().get('image_url')
    except Exception as e:
        print(f"Error uploading image: {e}")
        return None

# Test get event details
def test_get_event_details(event_id):
    response = requests.get(f"{BASE_URL}/{event_id}")
    print("Event Details:", response.json())

# Test update event images
def test_update_event_images(event_id, image_url):
    if not image_url:
        return
        
    update_data = {
        "image_url": image_url,
        "banner_image": image_url,  # Using same image for testing
    }
    response = requests.put(f"{BASE_URL}/update-images/{event_id}", json=update_data)
    print("Update Event Images:", response.json())

# Uncomment and run these tests as needed
# uploaded_image = test_image_upload()
# test_get_event_details("your_event_id_here")
# test_update_event_images("your_event_id_here", uploaded_image)
