import unittest
import json
from datetime import datetime
import sys

class TestVerifyRentalHistory(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "=" * 40)
        print("Initializing test")
        print("=" * 40)

    def test_verify_rental_history(self):
        # Read rentals from local JSON file
        with open('rentals.json', 'r') as file:
            rentals = json.load(file)
        
        # Verify the basic structure and date validity
        self.assertIsInstance(rentals, list)
        
        for rental in rentals:
            # Validate required fields
            self.assertIn('id', rental)
            self.assertIn('car_id', rental)
            self.assertIn('customer_name', rental)
            self.assertIn('customer_email', rental)
            self.assertIn('start_date', rental)
            self.assertIn('end_date', rental)
            self.assertIn('total_price', rental)
            self.assertIn('status', rental)
            
            # Parse and validate dates
            start_date = datetime.strptime(rental["start_date"], "%Y-%m-%d")
            end_date = datetime.strptime(rental["end_date"], "%Y-%m-%d")
            
            # Ensure end date is after start date
            self.assertTrue(end_date > start_date, 
                f"Invalid date range for rental {rental['id']}: "
                f"start {start_date} must be before end {end_date}")
            
            # Optional: Print rental details to terminal
            print(f"Rental ID: {rental['id']}")
            print(f"Car ID: {rental['car_id']}")
            print(f"Customer: {rental['customer_name']} ({rental['customer_email']})")
            print(f"Rental Period: {rental['start_date']} to {rental['end_date']}")
            print(f"Total Price: ${rental['total_price']}")
            print(f"Status: {rental['status']}")
            print("-" * 40)

    def test_rental_count(self):
        # Additional test to check total number of rentals
        with open('rentals.json', 'r') as file:
            rentals = json.load(file)
        
        # Example condition: Ensure at least one rental exists
        self.assertTrue(len(rentals) > 0, "No rentals found in the JSON file")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "=" * 40)
        print("This is the full history")
        print("Test completed")
        print("=" * 40)

if __name__ == '__main__':
    unittest.main()

if __name__ == '__main__':
    import xmlrunner
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'))