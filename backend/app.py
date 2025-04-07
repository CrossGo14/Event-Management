# app.py
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.auth_routes import auth_blueprint, initialize_indexes  # Import initialize_indexes
from routes.event_routes import event_blueprint

def create_app():
    # Load environment variables
    load_dotenv()

    app = Flask(__name__)

    # Enable CORS
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Set secret key
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise ValueError("SECRET_KEY not found in .env file")
    app.config["SECRET_KEY"] = secret_key

    # Register blueprints
    app.register_blueprint(auth_blueprint, url_prefix="/auth")
    app.register_blueprint(event_blueprint, url_prefix="/api/events")

    # Initialize database indexes after app creation
    with app.app_context():
        initialize_indexes()

    @app.route('/')
    def health_check():
        return {"status": "OK", "message": "Event Management API is running"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)