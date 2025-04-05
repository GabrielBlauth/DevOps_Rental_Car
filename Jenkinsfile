pipeline {
    agent any
    
    environment {
        // Try these locations in order
        PYTHON_PATHS = 'C:\\Python39\\python.exe;C:\\Python310\\python.exe;python;python3'
        VENV_DIR = 'venv'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']], 
                    userRemoteConfigs: [[url: 'https://github.com/GabrielBlauth/DevOps_Rental_Car.git']]
                )
            }
        }
        
        stage('Find Python') {
            steps {
                script {
                    // Try each possible Python path
                    def pythonExe = findPython()
                    if (pythonExe == null) {
                        error("Python not found! Tried: ${env.PYTHON_PATHS}")
                    }
                    env.PYTHON = pythonExe
                    echo "Using Python at: ${env.PYTHON}"
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                bat """
                    @echo off
                    echo Creating virtual environment...
                    "${env.PYTHON}" -m venv "${env.VENV_DIR}"
                    
                    echo Installing dependencies...
                    call "${env.VENV_DIR}\\Scripts\\activate"
                    pip install pytest pytest-html selenium
                    if exist requirements.txt pip install -r requirements.txt
                """
            }
        }
        
        stage('Run Tests') {
            stages {
                stage('Rental History') {
                    steps {
                        bat """
                            call "${env.VENV_DIR}\\Scripts\\activate"
                            cd RentTests
                            pytest test_rental_history.py -v
                        """
                    }
                }
                stage('Reserve Car') {
                    steps {
                        bat """
                            call "${env.VENV_DIR}\\Scripts\\activate"
                            cd RentTests
                            pytest test_reserve_car.py -v
                        """
                    }
                }
                stage('Search Cars') {
                    steps {
                        bat """
                            call "${env.VENV_DIR}\\Scripts\\activate"
                            cd RentTests
                            pytest test_search_cars.py -v
                        """
                    }
                }
            }
        }
        
        stage('Generate Report') {
            steps {
                bat """
                    call "${env.VENV_DIR}\\Scripts\\activate"
                    cd RentTests
                    pytest --html=report.html
                """
                archiveArtifacts artifacts: 'RentTests/report.html', fingerprint: true
            }
        }
    }
    
    post {
        always {
            bat """
                @echo off
                echo Cleaning up...
                if exist "${env.VENV_DIR}" rd /s /q "${env.VENV_DIR}"
            """
        }
    }
}

// Helper function to find Python
def findPython() {
    def paths = env.PYTHON_PATHS.split(';')
    for (path in paths) {
        try {
            // Check if python exists at this path
            def status = bat(
                script: "@echo off\n\"${path}\" --version > nul 2>&1",
                returnStatus: true
            )
            if (status == 0) {
                return path
            }
        } catch (Exception e) {
            continue
        }
    }
    return null
}