from flask import Blueprint, request, jsonify
import os
import requests

auth_blueprint = Blueprint("auth", __name__)

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

@auth_blueprint.route("/verify-session", methods=["GET"])
def verify_session():
    session_id = request.headers.get("X-Session-Id")

    if not session_id:
        return jsonify({"error": "Missing session ID"}), 401

    # Verify Clerk session using Clerk API
    clerk_url = f"https://api.clerk.dev/v1/sessions/{session_id}"
    response = requests.get(clerk_url, headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"})

    if response.status_code != 200:
        return jsonify({"error": "Invalid session"}), 401

    user_data = response.json()
    return jsonify({"message": "Session is valid", "user": user_data}), 200
