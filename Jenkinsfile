pipeline {
    agent any
    
    environment {
        
        PYTHON = 'python' // Will try python then python3
        VENV_DIR = 'venv'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']], 
                    extensions: [], 
                    userRemoteConfigs: [[url: 'https://github.com/GabrielBlauth/DevOps_Rental_Car.git']]
                )
            }
        }
        
        stage('Setup Environment') {
            steps {
                bat """
                    @echo off
                    :: Try python, then python3 if python doesn't work
                    ${PYTHON} --version > nul 2>&1
                    if %errorlevel% neq 0 (
                        set PYTHON=python3
                    )
                    
                    :: Create virtual environment
                    %PYTHON% -m venv ${VENV_DIR}
                    
                    :: Install requirements
                    call ${VENV_DIR}\\Scripts\\activate
                    pip install pytest selenium pytest-html
                    if exist requirements.txt pip install -r requirements.txt
                """
            }
        }
        
        stage('Test Rental History') {
            steps {
                bat """
                    call ${VENV_DIR}\\Scripts\\activate
                    cd RentTests
                    %PYTHON% -m pytest test_rental_history.py -v
                """
            }
        }
        
        stage('Test Reserve Car') {
            steps {
                bat """
                    call ${VENV_DIR}\\Scripts\\activate
                    cd RentTests
                    %PYTHON% -m pytest test_reserve_car.py -v
                """
            }
        }
        
        stage('Test Search Cars') {
            steps {
                bat """
                    call ${VENV_DIR}\\Scripts\\activate
                    cd RentTests
                    %PYTHON% -m pytest test_search_cars.py -v
                """
            }
        }
        
        stage('Generate Report') {
            steps {
                bat """
                    call ${VENV_DIR}\\Scripts\\activate
                    cd RentTests
                    %PYTHON% -m pytest --html=report.html
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'RentTests/report.html', fingerprint: true
                }
            }
        }
    }
    
    post {
        always {
            bat """
                @echo off
                :: Clean up virtual environment
                if exist ${VENV_DIR} rd /s /q ${VENV_DIR}
            """
        }
        success {
            echo 'All tests passed!'
        }
        failure {
            echo 'Some tests failed. Check the console output for details.'
        }
    }
}