# Kubernetes Configuration

This `k8s` directory contains the Kubernetes (k8s) configuration for deploying and managing the Robot Platform services.

## Components

The platform consists of the following components:

### Core Services

- **Robot Service**: Main application service to handle robots
  - Deployed using deployment and service configurations in `robot-service/`
  - Exposed via ingress at `robot.local`
- **Dashboard**: Frontend application to manage and monitor the robot platform
  - Deployed using deployment and service configurations in `dashboard/`
  - Exposed via ingress at `dashboard.local`

### Observability Stack

- **Prometheus**: Metrics collection and storage
- **Loki**: Log aggregation system
- **Promtail**: Log collector for Loki

## Prerequisites

- Minikube
- Docker
- kubectl
- sudo access (for hosts file modification)

## Setup

The platform can be set up using the provided `setup-k8s.sh` script in the root directory. The script:

1. Initializes a Minikube cluster with Docker driver
2. Enables the Ingress addon
3. Builds the robot-service and dashboard Docker images
4. Deploys all Kubernetes resources
5. Configures local DNS resolution via `/etc/hosts`

To set up the robot platform:

```bash
./setup-k8s.sh
```

## Access

Once deployed, the services are accessible at:

- Robot Service API: http://robot.local
- Dashboard: http://dashboard.local

## Troubleshooting

If services are not accessible, here are some useful commands to check:

1. Verify all pods are running:
   ```bash
   kubectl get pods
   ```
2. Check pod logs:
   ```bash
   kubectl logs -l app=<service-name>
   ```
3. Verify ingress configuration:
   ```bash
   kubectl get ingress
   ```
4. Ensure `robot.local` and `dashboard.local` is properly configured in `/etc/hosts`

Since observability services are not exposed, here are some tips to troubleshoot:

1. Forward ports to access from localhost:
   ```bash
   kubectl port-forward svc/<service-name> <port>:<port> &
   ```
2. Use curl to send requests to observability services:
   ```bash
   curl -G -s "http://localhost:3100/loki/api/v1/labels" # Loki
   curl -G -s "http://localhost:9080/targets" # Promtail
   ```

## Clean Up

To remove all resources:

```bash
minikube delete
```
