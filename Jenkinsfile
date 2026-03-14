pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "Checking out the project"
                git branch: 'main', url: 'https://github.com/RAKSHANSP/devops-project.git'
            }
        }

        stage('Build') {
            steps {
                echo "Building the application"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo "Running SonarQube Scan"
                withSonarQubeEnv('My Sonar Server') {
                    sh """
                    sonar-scanner \
                    -Dsonar.projectKey=devops-project \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://localhost:9000
                    """
                }
            }
        }

    }
}
