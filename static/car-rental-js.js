// static/js/script.js

document.addEventListener('DOMContentLoaded', function () {
    const carsList = document.getElementById('cars-list');
    const rentalsList = document.getElementById('rentals-list');
    const rentalFormSection = document.getElementById('rental-form-section');
    const rentalForm = document.getElementById('rental-form');
    const carIdInput = document.getElementById('car-id');
    const carDetailsElement = document.getElementById('car-details');
    const cancelRentalButton = document.getElementById('cancel-rental');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;

    init();

    function init() {
        loadCars();
        loadRentals();

        rentalForm.addEventListener('submit', handleRentalSubmit);
        cancelRentalButton.addEventListener('click', hideRentalForm);

        startDateInput.addEventListener('change', function () {
            endDateInput.min = startDateInput.value;
            if (endDateInput.value < startDateInput.value) {
                endDateInput.value = startDateInput.value;
            }
        });
    }

    function loadCars() {
        carsList.innerHTML = '<p>Loading cars...</p>';

        fetch('/api/cars?available=true')
            .then(response => response.json())
            .then(cars => {
                if (cars.length === 0) {
                    carsList.innerHTML = '<p>No cars available for rent at this time.</p>';
                    return;
                }

                carsList.innerHTML = '';

                cars.forEach(car => {
                    const carCard = document.createElement('div');
                    carCard.className = 'car-card';
                    carCard.innerHTML = `
                        <div class="carousel-container">
                            <div class="carousel">
                                <div class="carousel-item">
                                    <img src="/static/img/cars/${car.make}/1.jpg" alt="${car.make} ${car.model} Image 1">
                                </div>
                                <div class="carousel-item">
                                    <img src="/static/img/cars/${car.make}/2.jpg" alt="${car.make} ${car.model} Image 2">
                                </div>
                                <div class="carousel-item">
                                    <img src="/static/img/cars/${car.make}/3.jpg" alt="${car.make} ${car.model} Image 3">
                                </div>
                                <div class="carousel-item">
                                    <img src="/static/img/cars/${car.make}/4.jpg" alt="${car.make} ${car.model} Image 4">
                                </div>
                            </div>
                            <button class="carousel-button prev">&#10094;</button>
                            <button class="carousel-button next">&#10095;</button>
                        </div>
                        <h3>${car.make} ${car.model}</h3>
                        <div class="car-details">
                            <p><strong>Year:</strong> ${car.year}</p>
                        </div>
                        <p class="car-price">$${car.price_per_day} per day</p>
                        <button class="rent-button" data-id="${car.id}">Rent This Car</button>
                    `;

                    carsList.appendChild(carCard);

                    const carousel = carCard.querySelector('.carousel');
                    const prevButton = carCard.querySelector('.carousel-button.prev');
                    const nextButton = carCard.querySelector('.carousel-button.next');
                    let currentIndex = 0;

                    function updateCarousel() {
                        const offset = -currentIndex * 100;
                        carousel.style.transform = `translateX(${offset}%)`;
                    }

                    nextButton.addEventListener('click', () => {
                        currentIndex = (currentIndex + 1) % 4;
                        updateCarousel();
                    });

                    prevButton.addEventListener('click', () => {
                        currentIndex = (currentIndex - 1 + 4) % 4;
                        updateCarousel();
                    });

                    const rentButton = carCard.querySelector('.rent-button');
                    rentButton.addEventListener('click', function () {
                        showRentalForm(car);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading cars:', error);
                carsList.innerHTML = '<p>Error loading cars. Please try again later.</p>';
            });
    }

    function loadRentals() {
        rentalsList.innerHTML = '<p>Loading rentals...</p>';

        fetch('/api/rentals')
            .then(response => response.json())
            .then(rentals => {
                const activeRentals = rentals.filter(rental => rental.status === 'active');

                if (activeRentals.length === 0) {
                    rentalsList.innerHTML = '<p>You have no active rentals.</p>';
                    return;
                }

                rentalsList.innerHTML = '';

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

                            const returnButton = rentalCard.querySelector('.return-button');
                            returnButton.addEventListener('click', function () {
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

    function showRentalForm(car) {
        carIdInput.value = car.id;
        carDetailsElement.innerHTML = `${car.make} ${car.model} (${car.year}) - $${car.price_per_day} per day`;
    
        fetch(`/api/cars/${car.id}/reviews`)
            .then(res => res.json())
            .then(reviews => {
                const reviewsBox = document.createElement('div');
                reviewsBox.className = 'reviews-box';
                reviewsBox.innerHTML = '<h4>Last Reviews (Score 0–10)</h4>';
                if (reviews.length === 0) {
                    reviewsBox.innerHTML += '<p>No reviews yet.</p>';
                } else {
                    reviews.forEach(r => {
                        const comment = r.hasOwnProperty("review_text") && r.review_text.trim() !== ""
                            ? r.review_text
                            : "No comments.";
                    
                        reviewsBox.innerHTML += `
                            <p><strong>${r.customer_name}</strong>: ${r.score}/10</p>
                            <p style="margin-bottom: 10px; font-style: italic;">"${comment}"</p>
                        `;
                    });
                }
                carDetailsElement.appendChild(reviewsBox);
            })
            .catch(err => console.error('Error loading reviews:', err));
    
        rentalFormSection.classList.remove('hidden');
        rentalFormSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    

    function hideRentalForm() {
        rentalFormSection.classList.add('hidden');
        rentalForm.reset();
    }

    function handleRentalSubmit(event) {
        event.preventDefault();

        const carId = parseInt(carIdInput.value);
        const customerName = document.getElementById('customer-name').value;
        const customerEmail = document.getElementById('customer-email').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        const rentalData = {
            car_id: carId,
            customer_name: customerName,
            customer_email: customerEmail,
            start_date: startDate,
            end_date: endDate
        };

        fetch('/api/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rentalData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.error || 'Failed to create rental');
                    });
                }
                return response.json();
            })
            .then(newRental => {
                alert('Car rented successfully!');
                hideRentalForm();
                loadCars();
                loadRentals();
            })
            .catch(error => {
                console.error('Error creating rental:', error);
                alert(error.message || 'Error creating rental. Please try again.');
            });
    }

    function returnCar(rentalId) {
        if (!confirm('Are you sure you want to return this car?')) {
            return;
        }

        fetch(`/api/rentals/${rentalId}/return`, {
            method: 'PUT'
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.error || 'Failed to return car');
                    });
                }
                return response.json();
            })
            .then(result => {
                alert('Car returned successfully!');
                loadCars();
                loadRentals();
            })
            .catch(error => {
                console.error('Error returning car:', error);
                alert(error.message || 'Error returning car. Please try again.');
            });
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});
