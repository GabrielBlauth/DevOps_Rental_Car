pipeline {
    agent any
    
    environment {
        PYTHON_PATHS = 'C:\\Python39\\python.exe;C:\\Python310\\python.exe;python;python3'
        VENV_DIR = 'venv'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [[
                        $class: 'GitHubAccessTokenCredential',
                        credentialsId: 'github-token'
                    ]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/GabrielBlauth/DevOps_Rental_Car.git'
                    ]]
                ])
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
                            pytest test_rental_history.py -v --junitxml=test-results-rental.xml
                        """
                        junit 'RentTests/test-results-rental.xml'
                    }
                }
                stage('Reserve Car') {
                    steps {
                        bat """
                            call "${env.VENV_DIR}\\Scripts\\activate"
                            cd RentTests
                            pytest test_reserve_car.py -v --junitxml=test-results-reserve.xml
                        """
                        junit 'RentTests/test-results-reserve.xml'
                    }
                }
                stage('Search Cars') {
                    steps {
                        bat """
                            call "${env.VENV_DIR}\\Scripts\\activate"
                            cd RentTests
                            pytest test_search_cars.py -v --junitxml=test-results-search.xml
                        """
                        junit 'RentTests/test-results-search.xml'
                    }
                }
            }
        }
        
        stage('Generate Report') {
            steps {
                bat """
                    call "${env.VENV_DIR}\\Scripts\\activate"
                    cd RentTests
                    pytest --html=report.html --self-contained-html
                """
                archiveArtifacts artifacts: 'RentTests/report.html', fingerprint: true
                publishHTML target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'RentTests',
                    reportFiles: 'report.html',
                    reportName: 'HTML Test Report'
                ]
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
        success {
            emailext body: 'All tests passed successfully!', 
                    subject: 'SUCCESS: Build ${BUILD_NUMBER}',
                    to: 'your-email@example.com'
        }
        failure {
            emailext body: 'Some tests failed. Please check the build report.', 
                    subject: 'FAILURE: Build ${BUILD_NUMBER}',
                    to: 'your-email@example.com'
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