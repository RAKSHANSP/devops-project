pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/RAKSHANSP/devops-project.git'
            }
        }

        stage('Build') {
            steps {
                echo "Building the application"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('My Sonar Server') {
                    sh 'sonar-scanner'
                }
            }
        }

    }
}