pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(branches: [[name: '*/main']], 
                         extensions: [], 
                         userRemoteConfigs: [[url: 'https://github.com/GabrielBlauth/DevOps_Rental_Car.git']])
            }
        }
        
        stage('Setup Environment') {
            steps {
                sh '''
                    python -m venv venv || python3 -m venv venv
                    . venv/bin/activate
                    pip install pytest selenium pytest-html
                    if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
                '''
            }
        }
        
        stage('Test Rental History') {
            steps {
                sh '''
                    . venv/bin/activate
                    cd RentTests
                    python -m pytest test_rental_history.py -v
                '''
            }
        }
        
        stage('Test Reserve Car') {
            steps {
                sh '''
                    . venv/bin/activate
                    cd RentTests
                    python -m pytest test_reserve_car.py -v
                '''
            }
        }
        
        stage('Test Search Cars') {
            steps {
                sh '''
                    . venv/bin/activate
                    cd RentTests
                    python -m pytest test_search_cars.py -v
                '''
            }
        }
        
        stage('Generate Report') {
            steps {
                sh '''
                    . venv/bin/activate
                    cd RentTests
                    python -m pytest --html=report.html
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'RentTests/report.html', fingerprint: true
                }
            }
        }
    }
    
    post {
        success {
            echo 'All tests passed!'
        }
        failure {
            echo 'Some tests failed. Check the console output for details.'
        }
    }
}