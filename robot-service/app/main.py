from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Robot Service API")


# Robot data classes
class Robot(BaseModel):
    name: str
    type: str
    status: str = "idle"


class RobotWithID(Robot):
    id: int


class RobotPatch(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None


# In-memory storage to mock database
robots = {}


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
    robot_meta = RobotWithID(id=len(robots) + 1, **robot.dict())
    robots[robot_meta.id] = robot_meta
    return robot_meta


@app.patch("/robot", response_model=RobotWithID)
async def update_robot(robot_id: int, robot: RobotPatch):
    """Update robot data"""
    if robot_id not in robots:
        logger.error(f"Robot with ID {robot_id} not found")
        raise HTTPException(status_code=404, detail="Robot not found")

    logger.info(f"Updating robot with ID: {robot_id}")
    existing_robot = robots[robot_id]
    update_data = robot.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_robot, key, value)

    robots[robot_id] = existing_robot
    return existing_robot


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
