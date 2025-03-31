# app.py
# This is our main application file that sets up our Flask server and defines all our routes

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # This will help with cross-origin requests if frontend is separate
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Enable CORS for all routes

# Initialize our "database" (for simplicity, we're using a JSON file)
# In a real application, you would use a proper database like SQLite, PostgreSQL, etc.
def initialize_db():
    data_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(data_dir)
    
    
    # Check if our data files exist, and create them with initial data if they don't
    if not os.path.exists('cars.json'):
        with open('cars.json', 'w') as f:
            json.dump([
                {"id": 1, "make": "Toyota", "model": "Corolla", "year": 2024, "price_per_day": 45, "available": True},
                {"id": 2, "make": "Honda", "model": "Civic Hybrid", "year": 2025, "price_per_day": 50, "available": True},
                {"id": 3, "make": "Ford", "model": "Mustang GT", "year": 2024, "price_per_day": 85, "available": True},
                {"id": 4, "make": "Tesla", "model": "Model 3", "year": 2022, "price_per_day": 80, "available": True},
                {"id": 5, "make": "Nissan", "model": "Z Performance", "year": 2024, "price_per_day": 80, "available": True},
                {"id": 6, "make": "Mercedes", "model": "Benz CLA", "year": 2024, "price_per_day": 85, "available": True},
                {"id": 7, "make": "BMW", "model": "5 Series", "year": 2024, "price_per_day": 85, "available": True},
                {"id": 8, "make": "Lexus", "model": "LS 500", "year": 2024, "price_per_day": 80, "available": True},
                {"id": 9, "make": "Mini", "model": "Countryman S", "year": 2025, "price_per_day": 65, "available": True},
                {"id": 10, "make": "Genesis", "model": "GV70 3.5T", "year": 2024, "price_per_day": 70, "available": True},
                {"id": 11, "make": "Chevrolet", "model": "Silverado", "year": 2024, "price_per_day": 100, "available": True},
                {"id": 12, "make": "Hyundai", "model": "Tucson Hybrid", "year": 2024, "price_per_day": 80, "available": True},
            ], f, indent=2)
    
    if not os.path.exists('rentals.json'):
        with open('rentals.json', 'w') as f:
            json.dump([], f, indent=2)

# Call initialize_db at startup
initialize_db()

# Helper functions to read and write to our "database" files
def get_all_cars():
    with open('cars.json', 'r') as f:
        return json.load(f)

def save_cars(cars):
    with open('cars.json', 'w') as f:
        json.dump(cars, f, indent=2)

def get_all_rentals():
    with open('rentals.json', 'r') as f:
        return json.load(f)

def save_rentals(rentals):
    with open('rentals.json', 'w') as f:
        json.dump(rentals, f, indent=2)

# Route to serve the main page
@app.route('/')
def index():
    return render_template('index.html')

# API Routes

# Get all available cars
@app.route('/api/cars', methods=['GET'])
def get_cars():
    # Get the availability filter from query parameters, if any
    available_filter = request.args.get('available')
    
    cars = get_all_cars()
    
    # Filter cars by availability if specified
    if available_filter is not None:
        available_bool = available_filter.lower() == 'true'
        cars = [car for car in cars if car['available'] == available_bool]
    
    return jsonify(cars)

# Get a specific car by ID
@app.route('/api/cars/<int:car_id>', methods=['GET'])
def get_car(car_id):
    cars = get_all_cars()
    car = next((car for car in cars if car['id'] == car_id), None)
    
    if car:
        return jsonify(car)
    else:
        return jsonify({"error": "Car not found"}), 404

# Create a new rental
@app.route('/api/rentals', methods=['POST'])
def create_rental():
    # Get the rental data from the request
    rental_data = request.json
    
    # Validate required fields
    required_fields = ['car_id', 'customer_name', 'customer_email', 'start_date', 'end_date']
    for field in required_fields:
        if field not in rental_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if the car exists and is available
    cars = get_all_cars()
    car = next((car for car in cars if car['id'] == rental_data['car_id']), None)
    
    if not car:
        return jsonify({"error": "Car not found"}), 404
    
    if not car['available']:
        return jsonify({"error": "Car is not available for rental"}), 400
    
    # Create the rental record
    rentals = get_all_rentals()
    
    # Calculate the total price
    start_date = datetime.strptime(rental_data['start_date'], '%Y-%m-%d')
    end_date = datetime.strptime(rental_data['end_date'], '%Y-%m-%d')
    days = (end_date - start_date).days + 1  # Include both start and end days
    
    if days <= 0:
        return jsonify({"error": "End date must be after start date"}), 400
    
    total_price = days * car['price_per_day']
    
    # Generate a new rental ID
    new_id = 1
    if rentals:
        new_id = max(rental['id'] for rental in rentals) + 1
    
    # Create the new rental object
    new_rental = {
        "id": new_id,
        "car_id": rental_data['car_id'],
        "customer_name": rental_data['customer_name'],
        "customer_email": rental_data['customer_email'],
        "start_date": rental_data['start_date'],
        "end_date": rental_data['end_date'],
        "total_price": total_price,
        "status": "active"
    }
    
    # Add to rentals and update car availability
    rentals.append(new_rental)
    save_rentals(rentals)
    
    # Update car availability
    car['available'] = False
    save_cars(cars)
    
    return jsonify(new_rental), 201

# Get all rentals
@app.route('/api/rentals', methods=['GET'])
def get_rentals():
    rentals = get_all_rentals()
    return jsonify(rentals)

# Return a car (end a rental)
@app.route('/api/rentals/<int:rental_id>/return', methods=['PUT'])
def return_car(rental_id):
    # Find the rental
    rentals = get_all_rentals()
    rental = next((r for r in rentals if r['id'] == rental_id), None)
    
    if not rental:
        return jsonify({"error": "Rental not found"}), 404
    
    if rental['status'] != 'active':
        return jsonify({"error": "Rental is not active"}), 400
    
    # Update the rental status
    rental['status'] = 'completed'
    save_rentals(rentals)
    
    # Make the car available again
    cars = get_all_cars()
    car = next((car for car in cars if car['id'] == rental['car_id']), None)
    
    if car:
        car['available'] = True
        save_cars(cars)
    
    return jsonify({"message": "Car returned successfully", "rental": rental})

# Main entry point to run the application
@app.route('/api/cars/<int:car_id>/reviews', methods=['GET'])
def get_car_reviews(car_id):
    rentals = get_all_rentals()
    reviews = []

    for r in rentals:
        if r.get("car_id") == car_id and "score" in r and r["score"] is not None:
            reviews.append({
                "customer_name": r["customer_name"],
                "score": r["score"],
                "review_text": r.get("review_text", "")
            })

    reviews = reviews[-3:][::-1]
    return jsonify(reviews)


# Main entry point
if __name__ == '__main__':
    app.run(debug=True)


