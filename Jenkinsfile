pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Dependências') {
            steps {
                sh 'npm install' 
            }
        }
        stage('Testes') {
            steps {
                sh 'npm test'  
            }
        }
    }
}