pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "Checking out source code"
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
                echo "Running SonarQube analysis"
                withSonarQubeEnv('My Sonar Server') {
                    sh 'sonar-scanner'
                }
            }
        }

    }
}
