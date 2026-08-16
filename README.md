# DevOps Rental Car

A simple Rental Car Management System, built to practice a full DevOps workflow — from application code to automated testing and CI pipeline — as part of a Computer Science DevOps module.

## Overview

This application manages a small car rental service: browsing available vehicles, creating and closing rentals, and tracking rental history and pricing. It was built specifically to have something real to run through an automated Jenkins pipeline, not just as a standalone app.

## Features

- **Browse Fleet** — list all cars, with an optional filter by availability
- **Create Rental** — book a car for a date range; automatically calculates total price based on days rented and marks the car as unavailable
- **Return Car** — close out an active rental and make the car available again
- **Rental History** — view all past and active rentals
- **Reviews** — view the most recent reviews left for a specific car

## Technology Stack
- **Backend:** Python / Flask (REST API)
- **Frontend:** HTML5, JavaScript, served via Flask templates
- **Data storage:** JSON files (`cars.json`, `rentals.json`) — simple file-based persistence for demo/testing purposes
- **Testing:** pytest + Selenium (`RentTests/`)
- **CI/CD:** Jenkins pipeline (see `Jenkinsfile`) — sets up a virtual environment, runs the full pytest suite, and publishes an HTML test report on every run

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/GabrielBlauth/DevOps_Rental_Car.git
   cd DevOps_Rental_Car
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python app.py
   ```
4. The app will be available at `http://localhost:5000`

## Running Tests

Tests live in `RentTests/` and run via pytest:
```
cd RentTests
pytest -v
```

The same suite runs automatically in the Jenkins pipeline on every build, with results published as an HTML report.

## Project Structure
```
DevOps_Rental_Car/
├── app.py              # Flask app and API routes
├── cars.json            # Vehicle inventory (auto-created on first run)
├── rentals.json          # Rental records (auto-created on first run)
├── static/              # Frontend static assets
├── templates/            # Frontend HTML templates
├── RentTests/            # pytest / Selenium test suite
└── Jenkinsfile           # CI pipeline definition
```

## Contributing

This project was developed as part of a DevOps module in our Computer Science course. Contributors:
- João Henrique
- Gabriel Blauth
- Marcos Fernandes
- Luan Paes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Professor Sakshi Panchale for guidance.
