# Robot Platform

A modern, cloud-native robot management platform built with FastAPI, React, and Kubernetes.

## Local Setup

### Prerequisites

- Docker
- Minikube
- kubectl
- Node.js v18+
- npm v9+
- Python 3.11+
- sudo access

### Quick Start

1. Clone the repository:

```bash
git clone https://github.com/sff0219/robot-platform.git
cd robot-platform
```

2. Start the Kubernetes cluster and deploy services:

```bash
./setup-k8s.sh
```

3. Access the services:

- Dashboard: http://dashboard.local
- Robot Service API: http://robot.local
- API Documentation: http://robot.local/docs

For detailed development environment setup instructions for individual components:

- [Robot Service Setup](robot-service/README.md)
- [Dashboard Setup](dashboard/README.md)
- [Kubernetes Configuration](k8s/README.md)

## Architecture

Refer [Architecture Documentation](doc/architecture.md) for a detailed explanation of the architecture for the robot platform.
