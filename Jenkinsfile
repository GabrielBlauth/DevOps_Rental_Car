pipeline {
    agent any
    stages {
        stage('Rental History Test') {
            steps {
                sh 'python -m unittest RentTests/test_rental_history.py'
            }
        }
        stage('Reserve Car Test') {
            steps {
                sh 'python -m unittest RentTests/test_reserve_car.py'
            }
        }
        stage('Search Cars Test') {
            steps {
                sh 'python -m unittest RentTests/test_search_cars.py'
            }
        }
    }
}