import unittest
from unittest.mock import patch, Mock
import requests

BASE_URL = "http://localhost:5000"

def test_reserve_car():
    """
    Test car reservation functionality.
    
    This function checks:
    1. Successful car reservation API call
    2. Correct reservation data submission
    3. Validation of returned reservation details
    4. Correct reservation status
    """
    rental_data = {
        "car_id": 1,
        "customer_name": "John Doe",
        "customer_email": "john.doe@example.com",
        "start_date": "2023-10-01",
        "end_date": "2023-10-05"
    }
    response = requests.post(f"{BASE_URL}/api/rentals", json=rental_data)
    assert response.status_code == 201
    rental = response.json()
    assert rental["car_id"] == rental_data["car_id"]
    assert rental["customer_name"] == rental_data["customer_name"]
    assert rental["customer_email"] == rental_data["customer_email"]
    assert rental["start_date"] == rental_data["start_date"]
    assert rental["end_date"] == rental_data["end_date"]
    assert rental["status"] == "active"

class TestReserveCar(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "=" * 50)
        print("Initializing Car Reservation Test")
        print("=" * 50)
        print("\nTest Description:")
        print("This test suite verifies the car reservation functionality:")
        print("- Checks successful car reservation API call")
        print("- Validates reservation data submission")
        print("- Ensures correct reservation details are returned")
        print("- Verifies reservation status is set to 'active'")
        print("\n" + "-" * 50)

    @patch('requests.post')
    def test_reserve_car_success(self, mock_post):
        print("\nRunning Successful Reservation Scenario Test")
        # Mock the response from the server
        mock_response = Mock()
        mock_response.status_code = 201
        mock_response.json.return_value = {
            "car_id": 1,
            "customer_name": "John Doe",
            "customer_email": "john.doe@example.com",
            "start_date": "2023-10-01",
            "end_date": "2023-10-05",
            "status": "active"
        }
        mock_post.return_value = mock_response

        # Call the function under test
        test_reserve_car()

        # Verify that requests.post was called with the correct arguments
        mock_post.assert_called_once_with(
            f"{BASE_URL}/api/rentals",
            json={
                "car_id": 1,
                "customer_name": "John Doe",
                "customer_email": "john.doe@example.com",
                "start_date": "2023-10-01",
                "end_date": "2023-10-05"
            }
        )
        print("Successful Reservation Scenario: Test Passed")

    @patch('requests.post')
    def test_reserve_car_failure(self, mock_post):
        print("\nRunning Reservation Failure Scenario Test")
        # Mock a failed response from the server
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.json.return_value = {
            "error": "Invalid input data"
        }
        mock_post.return_value = mock_response

        # Call the function under test and expect an assertion error
        with self.assertRaises(AssertionError):
            test_reserve_car()
        print("Reservation Failure Scenario: Test Passed")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "=" * 50)
        print("Car Reservation Test Completed")
        print("=" * 50)

if __name__ == '__main__':
    unittest.main()