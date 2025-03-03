// static/script.js

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', function() {
    // Store references to DOM elements we'll use repeatedly
    const carsList = document.getElementById('cars-list');
    const rentalsList = document.getElementById('rentals-list');
    const rentalFormSection = document.getElementById('rental-form-section');
    const rentalForm = document.getElementById('rental-form');
    const carIdInput = document.getElementById('car-id');
    const carDetailsElement = document.getElementById('car-details');
    const cancelRentalButton = document.getElementById('cancel-rental');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    // Set minimum dates for the date inputs (can't rent in the past)
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;
    
    // Initialize the application
    init();
    
    // Main initialization function
    function init() {
        // Load available cars and active rentals
        loadCars();
        loadRentals();
        
        // Set up event listeners
        rentalForm.addEventListener('submit', handleRentalSubmit);
        cancelRentalButton.addEventListener('click', hideRentalForm);
        
        // Add event listener for start date to update end date minimum
        startDateInput.addEventListener('change', function() {
            endDateInput.min = startDateInput.value;
            
            // If end date is now before start date, update it
            if (endDateInput.value < startDateInput.value) {
                endDateInput.value = startDateInput.value;
            }
        });
    }
    
    // Function to load available cars from the API
    function loadCars() {
        // Show loading message
        carsList.innerHTML = '<p>Loading cars...</p>';
        
        // Fetch only available cars
        fetch('/api/cars?available=true')
            .then(response => response.json())
            .then(cars => {
                if (cars.length === 0) {
                    carsList.innerHTML = '<p>No cars available for rent at this time.</p>';
                    return;
                }
                
                // Clear loading message
                carsList.innerHTML = '';
                
                // Display each car as a card
                cars.forEach(car => {
                    const carCard = document.createElement('div');
                    carCard.className = 'car-card';
                    carCard.innerHTML = `
                        <h3>${car.make} ${car.model}</h3>
                        <div class="car-details">
                            <p><strong>Year:</strong> ${car.year}</p>
                        </div>
                        <p class="car-price">$${car.price_per_day} per day</p>
                        <button class="rent-button" data-id="${car.id}">Rent This Car</button>
                    `;
                    
                    carsList.appendChild(carCard);
                    
                    // Add click event to the rent button
                    const rentButton = carCard.querySelector('.rent-button');
                    rentButton.addEventListener('click', function() {
                        showRentalForm(car);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading cars:', error);
                carsList.innerHTML = '<p>Error loading cars. Please try again later.</p>';
            });
    }
    
    // Function to load active rentals from the API
    function loadRentals() {
        // Show loading message
        rentalsList.innerHTML = '<p>Loading rentals...</p>';
        
        // Fetch all rentals
        fetch('/api/rentals')
            .then(response => response.json())
            .then(rentals => {
                // Filter to only active rentals
                const activeRentals = rentals.filter(rental => rental.status === 'active');
                
                if (activeRentals.length === 0) {
                    rentalsList.innerHTML = '<p>You have no active rentals.</p>';
                    return;
                }
                
                // Clear loading message
                rentalsList.innerHTML = '';
                
                // For each active rental, we need to get the car details
                activeRentals.forEach(rental => {
                    fetch(`/api/cars/${rental.car_id}`)
                        .then(response => response.json())
                        .then(car => {
                            const rentalCard = document.createElement('div');
                            rentalCard.className = 'rental-card';
                            rentalCard.innerHTML = `
                                <p class="rental-car">${car.make} ${car.model} (${car.year})</p>
                                <p class="rental-dates">
                                    <strong>Rental Period:</strong> 
                                    ${formatDate(rental.start_date)} to ${formatDate(rental.end_date)}
                                </p>
                                <p class="rental-price">
                                    <strong>Total Price:</strong> $${rental.total_price}
                                </p>
                                <button class="return-button" data-id="${rental.id}">Return Car</button>
                            `;
                            
                            rentalsList.appendChild(rentalCard);
                            
                            // Add click event to the return button
                            const returnButton = rentalCard.querySelector('.return-button');
                            returnButton.addEventListener('click', function() {
                                returnCar(rental.id);
                            });
                        })
                        .catch(error => {
                            console.error('Error loading car details:', error);
                        });
                });
            })
            .catch(error => {
                console.error('Error loading rentals:', error);
                rentalsList.innerHTML = '<p>Error loading rentals. Please try again later.</p>';
            });
    }
    
    // Function to show the rental form for a specific car
    function showRentalForm(car) {
        // Set the car ID in the hidden input
        carIdInput.value = car.id;
        
        // Display car details
        carDetailsElement.textContent = `${car.make} ${car.model} (${car.year}) - $${car.price_per_day} per day`;
        
        // Show the form section
        rentalFormSection.classList.remove('hidden');
        
        // Scroll to the form
        rentalFormSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to hide the rental form
    function hideRentalForm() {
        rentalFormSection.classList.add('hidden');
        rentalForm.reset();
    }
    
    // Function to handle rental form submission
    function handleRentalSubmit(event) {
        // Prevent the default form submission
        event.preventDefault();
        
        // Get form values
        const carId = parseInt(carIdInput.value);
        const customerName = document.getElementById('customer-name').value;
        const customerEmail = document.getElementById('customer-email').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        // Create rental data object
        const rentalData = {
            car_id: carId,
            customer_name: customerName,
            customer_email: customerEmail,
            start_date: startDate,
            end_date: endDate
        };
        
        // Send the rental request to the API
        fetch('/api/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rentalData)
        })
        .then(response => {
            if (!response.ok) {
                // If response is not OK, parse the error message
                return response.json().then(error => {
                    throw new Error(error.error || 'Failed to create rental');
                });
            }
            return response.json();
        })
        .then(newRental => {
            // Show success message
            alert('Car rented successfully!');
            
            // Hide and reset the form
            hideRentalForm();
            
            // Reload cars and rentals to update the UI
            loadCars();
            loadRentals();
        })
        .catch(error => {
            console.error('Error creating rental:', error);
            alert(error.message || 'Error creating rental. Please try again.');
        });
    }
    
    // Function to return a car (end a rental)
    function returnCar(rentalId) {
        if (!confirm('Are you sure you want to return this car?')) {
            return;
        }
        
        // Send the return request to the API
        fetch(`/api/rentals/${rentalId}/return`, {
            method: 'PUT'
        })
        .then(response => {
            if (!response.ok) {
                // If response is not OK, parse the error message
                return response.json().then(error => {
                    throw new Error(error.error || 'Failed to return car');
                });
            }
            return response.json();
        })
        .then(result => {
            // Show success message
            alert('Car returned successfully!');
            
            // Reload cars and rentals to update the UI
            loadCars();
            loadRentals();
        })
        .catch(error => {
            console.error('Error returning car:', error);
            alert(error.message || 'Error returning car. Please try again.');
        });
    }
    
    // Helper function to format dates
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});
