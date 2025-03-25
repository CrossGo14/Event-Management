from flask import Flask
from flask_cors import CORS
from routes.event_routes import event_blueprint

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests
app.config["SECRET_KEY"] = "your_secret_key"

# Register Routes
app.register_blueprint(event_blueprint, url_prefix="/events")

if __name__ == "__main__":
    app.run(debug=True)
