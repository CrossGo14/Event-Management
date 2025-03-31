import os
from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_blueprint
from routes.event_routes import event_blueprint

def create_app():
    # Initialize Flask application
    app = Flask(__name__)

    # Enable CORS for all routes with proper configuration
    CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

    # Set secret key from environment
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

    # Register Routes
    app.register_blueprint(auth_blueprint, url_prefix="/auth")
    app.register_blueprint(event_blueprint, url_prefix="/api/events")
    
    return app

# Create app instance
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)