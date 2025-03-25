from flask import Flask
from database import db
from routes.auth_routes import auth_blueprint
# from routes.event_routes import event_blueprint


app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"

# Register routes
# app.register_blueprint(auth_blueprint, url_prefix="/auth")
# app.register_blueprint(event_blueprint, url_prefix="/events")

if __name__ == "__main__":
    app.run(debug=True)
