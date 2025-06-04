# Robot Platform Dashboard

A modern web UI for managing and monitoring the robot platform. Built with React, Material-UI, and TypeScript.

## Features

1. **Robots Management**

   - View all robots
   - Add new robots
   - Update robots

2. **Metrics Visualization**

   - Real-time metrics from Prometheus
   - System performance monitoring
   - Robot-related metrics

3. **Log Viewer**
   - Centralized log viewing from all services
   - Log filtering and search
   - Real-time log streaming

## Prerequisites

- Node.js (v18.19.1)
- npm (9.2.0)
- Configured Kubernetes cluster with backend services:
  - Robot Service
  - Prometheus
  - Loki

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Deploy backend services with Kubernetes and forward ports of Prometheus and Loki. Make sure they are reachable:

- Robot Service via http://robot.local
- Prometheus via http://localhost:9090
- Loki via http://localhost:3100:

```bash
./setup-k8s.sh
kubectl port-forward svc/prometheus 9090:9090 &
kubectl port-forward svc/loki 3100:3100 &
```

4. Access the dashboard by opening http://lcoalhost:5173 in the browser

## API Endpoints

The dashboard interacts with the following endpoints:

- **Robot Service**: http://robot.local

  - GET /robots - List all robots
  - POST /robots - Add new robots
  - PATCH /robot - Update robots

- **Prometheus**: http://localhost:9090

  - GET /api/v1/query_range - Query metrics for a certain range
  - GET /api/v1/label/\_\_name\_\_/values - Fetch all metric names

- **Loki**: http://localhost:3100/loki/api/v1
  - GET /labels - Get all lables of logs
  - GET /label/<label>/values - Get all values of a given label
  - GET /query_range - Query logs based on query, time range and limit

## Building for Production

1. Build the application:

   ```bash
   npm run build
   ```

2. The build output will be in the `dist` directory

3. The production dashboard application is deployed into the Kubernetes cluster, so the relevant steps can be found in [setp-k8s.sh](../setup-k8s.sh)

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Main page components
├── services/         # API service integrations
└── types/            # TypeScript type definitions
.gitignore            # Git ignore rules
Dockerfile            # Container configuration
eslint.config.js      # ESLint configuration
index.html            # Entry point
nginx.conf            # Nginx configuration for production in Kubernetes
package*.json         # Dependencies and scripts
README.md             # Project documentation
tsconfig*.json        # TypeScript configuration
vite.config.ts        # Vite configuration for development
```
