from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from typing import List, Optional
import logging
import uuid
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Robot Service API")

# Setup Prometheus metrics
ROBOTS_ADDED = Counter("robots_added_total", "Total number of robots added")
REQUEST_DURATION = Histogram("request_duration_seconds", "Request duration in seconds")


# Robot data classes
class Robot(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    type: str
    status: str = "idle"


class RobotWithID(Robot):
    id: str


class RobotPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None


# In-memory storage to mock database
robots = {}


# Middleware for request duration calculation
@app.middleware("http")
async def track_request_duration(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    REQUEST_DURATION.observe(duration)
    return response


# API routes
@app.get("/robots", response_model=List[RobotWithID])
async def get_robots():
    """Get all robots with their status"""
    logger.info("Fetching all robots")
    return list(robots.values())


@app.post("/robots", response_model=RobotWithID)
async def add_robot(robot: Robot):
    """Add a new robot"""
    logger.info(f"Adding new robot: {robot.name}")
    id = str(uuid.uuid4())
    robot_meta = RobotWithID(id=id, **robot.model_dump())
    robots[robot_meta.id] = robot_meta

    ROBOTS_ADDED.inc()
    return robot_meta


@app.patch(
    "/robot",
    response_model=RobotWithID,
    responses={
        404: {
            "content": {"application/json": {"example": {"detail": "Robot not found"}}}
        }
    },
)
async def update_robot(robot_id: str, robot: RobotPatch):
    """Update robot data"""
    if robot_id not in robots:
        logger.error(f"Robot with ID {robot_id} not found")
        raise HTTPException(status_code=404, detail="Robot not found")

    logger.info(f"Updating robot with ID: {robot_id}")
    existing_robot = robots[robot_id]
    update_data = robot.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_robot, key, value)

    robots[robot_id] = existing_robot
    return existing_robot


@app.get("/metrics")
async def get_metrics():
    """Expose Prometheus metrics"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
