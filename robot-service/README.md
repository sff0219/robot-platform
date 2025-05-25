# Robot Service API

A FastAPI-based REST API service for managing robots.

## Features

- REST API endpoints for managing robots (GET, POST, PATCH)
- Prometheus metrics endpoint (TODO)
- Logging
- Unit tests
- Docker support

## API Endpoints

- `GET /robots` - Get all robots with their status
- `POST /robots` - Add a new robot
- `PATCH /robot` - Update robot data for a specific robot

## Local Development Environment

Create a Python virtual environment and install dependencies:
```bash
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements_dev.txt
```

## Running API Locally

Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## Running Unit Tests

```bash
python3 -m pytest -rsA tests/
```

## Docker Build and Run

1. Build the Docker image:
```bash
docker build -t robot-service .
```

2. Run the container:
```bash
docker run -p 8000:8000 robot-service
```

## API Documentation

Once the service is running, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
