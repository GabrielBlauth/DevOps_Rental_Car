import unittest
from unittest.mock import patch, Mock
import sys
import requests

BASE_URL = "http://localhost:5000"

def test_fetch_available_cars():
    """
    Fetch and verify available cars from the API.
    
    This function checks:
    1. Successful API call to fetch available cars
    2. Correct response status code
    3. Each car in the response is marked as available
    """
    response = requests.get(f"{BASE_URL}/api/cars", params={"available": "true"})
    assert response.status_code == 200
    cars = response.json()
    assert isinstance(cars, list)
    for car in cars:
        assert car["available"] == True

class TestFetchAvailableCars(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "=" * 50)
        print("Initializing Available Cars Test")
        print("=" * 50)
        print("\nTest Description:")
        print("This test suite verifies the functionality of fetching available cars:")
        print("- Checks successful API call")
        print("- Validates response status code")
        print("- Ensures all returned cars are marked as available")
        print("\n" + "-" * 50)

    @patch('requests.get')
    def test_fetch_available_cars_success(self, mock_get):
        print("\nRunning Success Scenario Test")
        # Mock the response from the server
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {"id": 1, "make": "Toyota", "model": "Corolla", "year": 2022, "price_per_day": 50, "available": True},
            {"id": 2, "make": "Honda", "model": "Civic", "year": 2021, "price_per_day": 45, "available": True}
        ]
        mock_get.return_value = mock_response

        # Call the function under test
        test_fetch_available_cars()

        # Verify that requests.get was called with the correct arguments
        mock_get.assert_called_once_with(
            f"{BASE_URL}/api/cars",
            params={"available": "true"}
        )
        print("Success Scenario: Test Passed Successfully")

    @patch('requests.get')
    def test_fetch_available_cars_failure(self, mock_get):
        print("\nRunning Failure Scenario Test")
        # Mock a failed response from the server
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.json.return_value = {
            "error": "Internal server error"
        }
        mock_get.return_value = mock_response

        # Call the function under test and expect an assertion error
        with self.assertRaises(AssertionError):
            test_fetch_available_cars()
        print("Failure Scenario: Test Passed Successfully")
        

    @classmethod
    def tearDownClass(cls):
        print("\n" + "=" * 50)
        print("Test Completed")
        print("=" * 50)

if __name__ == '__main__':
    unittest.main()

if __name__ == '__main__':
    import xmlrunner
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'))