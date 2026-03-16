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
                sh 'echo Building the project'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('My Sonar Server') {
                    sh '''
                    sonar-scanner \
                    -Dsonar.projectKey=devops-project \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://localhost:9000
                    '''
                }
            }
        }

    }
}