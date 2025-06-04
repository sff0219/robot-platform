# Robot Platform Architecture

## System Overview

The Robot Platform is a cloud-native application designed to manage and monitor robots. It follows a modern microservices architecture pattern with three main layers hosting in a Kubernetes cluster:

1. Frontend Layer (Presentation) - Dashboard UI
2. Backend Layer (Business Logic) - Robot Service API
3. Observability Layer (Monitoring & Logging) - Prometheus, Loki, Promtail

![Robot Platform Architecture](./robot-platform.svg)

## Component Details

### 1. Frontend Layer - Dashboard (React + TypeScript)

**Key Components:**

- React for UI rendering
- TypeScript for type safety
- Material-UI for component library

**Key Features:**

- Robot management interface
- Real-time metrics visualization
- Log viewing and filtering

### 2. Backend Layer - Robot Service (FastAPI)

**API Design:**

```
GET    /robots       # List all robots
POST   /robots       # Add new robots
PATCH  /robot        # Update robot status
GET    /metrics      # Prometheus metrics endpoint
```

**Data Models:**

```
Robot:
  - id: UUID
  - name: str
  - type: str
  - status: str
```

**Metrics Exposed:**

- `robots_added_total`: Counter of robots added
- `request_duration_seconds`: Histogram of request durations

### 3. Observability Layer

#### Metrics Stack (Prometheus)

**Components:**

- Prometheus Server v2.45.0
- Service Discovery via Kubernetes
- Pull-based metrics collection

**Key Metrics:**

- HTTP request metrices
- Robot service metrics
- Monitoring and logging service metrices

#### Logging Stack (Loki + Promtail)

**Components:**

- Loki v2.9.0 for log aggregation
- Promtail v2.9.3 for log collection
- Label-based indexing
- Log streaming support

## Technology Choices

### Backend (Robot Service)

**FastAPI**

- High performance, async-first Python framework
- Automatic OpenAPI/Swagger documentation
- Built-in data validation with Pydantic
- Easy to test and maintain with dependency injection
- Great developer experience with type hints and modern Python features

### Frontend (Dashboard)

**React + TypeScript**

- Strong type safety and better developer experience with TypeScript
- Large ecosystem of libraries and tools
- Component-based architecture for reusability
- Material-UI for consistent, modern UI components
- React Query for efficient server state management

### Observability

**Prometheus**

- De facto standard for metrics in cloud-native applications
- Pull-based architecture that works well with Kubernetes
- Powerful PromQL query language
- Rich ecosystem of exporters and integrations
- Built-in alerting capabilities

**Loki + Promtail**

- Native Kubernetes integration
- Label-based log aggregation (similar to Prometheus)
- Efficient log storage with index separation
- Easy integration with Grafana for visualization

### Container Orchestration

**Kubernetes**

- Industry standard for container orchestration
- Declarative configuration
- Built-in service discovery and load balancing
- Robust scaling and self-healing capabilities
- Rich ecosystem of tools and extensions

## Assumptions and Tradeoffs

### Architecture Decisions

1. **Monolithic Backend**

   - Current: Simple deployment and development for current scale as a prototype
   - Future: May need to split into microservices as complexity grows

2. **In-Memory Storage**

   - Current: Quick to implement in-memory storage for prototype
   - Future: Implement proper database for production

3. **Metric and Log Visualization**

   - Current: Quick, simple and self-built visualization on dashboard UI
   - Future: Use Grafana for a better and detailed visualization

### Scalability and Availability Considerations

1. **Single Replica Deployment**

   - Current: Simple setup for development, no horizontal scaling, no high availability
   - Future: Configure autoscaling for production

2. **Monitoring Alerts**

   - Current: No monitoring alerts
   - Future: Configure monitoring alerts and define actions based on alerts

3. **Backup and Disaster Recovery**
   - Current: No backup and disaster recovery
   - Future: Configure backup and disaster recovery for better availability

### Security Considerations

1. **No Authentication/Authorization**

   - Current: Open access for development
   - Future: Implement proper auth system like OAuth2/JWT

2. **Plain HTTP**

   - Current: Simple setup for local development
   - Future: Use HTTPS with TLS termination in production

3. **Secrets Management**

   - Current: No secrets management
   - Future: Use Kubernetes Secrets to manage sensitive data

4. **Network Policies**
   - Current: No network policies
   - Future: Configure network policies to restrict traffic, implement rate limiting and API quotas

### Observability Setup

1. **Basic Metrics**

   - Current: Request counts and durations
   - Future: Add more detailed business metrics

2. **Log Aggregation**
   - Current: Basic structured logging
   - Future: Add log retention policies and archival

### Development Workflow

1. **Local Kubernetes**

   - Current: Development environment matches production
   - Future: Need to differentiate `dev` and `prod` deployments for higher resource usage and complexity

2. **Direct Image Building and Loading**

   - Current: Build docker images and use them directly for fast local development cycle
   - Future: Need proper CI/CD and registry for production

3. **Tests**
   - Current: Only unit tests for robot-service
   - Future: Implement proper test pipeline (unit tests for all components, integration tests and end-to-end UI tests)
