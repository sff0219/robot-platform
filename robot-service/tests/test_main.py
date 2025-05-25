from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)

POST_MOCK = {"name": "Test Robot", "type": "Type ABC"}

POST_MOCK_MISSING_REQUIRED = {"name": "Test Robot"}

POST_MOCK_INVALID_FIELD = {
    "name": "Test Robot",
    "type": "Type ABC",
    "invalid": "invalid",
}

POST_MOCK_WITH_OPTIONAL = {
    "name": "Test Robot",
    "type": "Type ABC",
    "status": "very busy",
}

PATCH_DATA = {"status": "busy"}

PATCH_DATA_INVALID_FIELD = {"invalid": "invalid"}

ROBOT_MOCK = {"name": "Test Robot", "type": "Type ABC", "status": "idle"}

ROBOT_MOCK_POST_PATCH = {"name": "Test Robot", "type": "Type ABC", "status": "busy"}


def test_get_robots_empty():
    response = client.get("/robots")
    assert response.status_code == 200
    assert response.json() == []


def test_post_robots():
    response = client.post("/robots", json=POST_MOCK)
    assert response.status_code == 200
    assert "id" in response.json()
    response_without_id = {k: v for k, v in response.json().items() if k != "id"}
    assert response_without_id == ROBOT_MOCK


def test_get_robots_after_post():
    response = client.get("/robots")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert "id" in response.json()[0]
    response_without_id = {k: v for k, v in response.json()[0].items() if k != "id"}
    assert response_without_id == ROBOT_MOCK


def test_post_robots_missing_required():
    response = client.post("/robots", json=POST_MOCK_MISSING_REQUIRED)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Field required"


def test_post_robots_invalid_filed():
    response = client.post("/robots", json=POST_MOCK_INVALID_FIELD)
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Extra inputs are not permitted"


def test_post_robots_with_optional_feild():
    response = client.post("/robots", json=POST_MOCK_WITH_OPTIONAL)
    assert response.status_code == 200
    assert response.json()["status"] == "very busy"


def test_patch_robot():
    # First, add a new robot
    add_response = client.post("/robots", json=POST_MOCK)
    robot_id = add_response.json()["id"]

    # Update the robot
    response = client.patch(f"/robot?robot_id={robot_id}", json=PATCH_DATA)
    assert response.status_code == 200
    response_without_id = {k: v for k, v in response.json().items() if k != "id"}
    assert response_without_id == ROBOT_MOCK_POST_PATCH


def test_patch_nonexistent_robot():
    response = client.patch("/robot?robot_id=abc123", json=PATCH_DATA)
    assert response.status_code == 404
    assert response.json()["detail"] == "Robot not found"


def test_patch_robot_invalid_field():
    # First, add a new robot
    add_response = client.post("/robots", json=POST_MOCK)
    robot_id = add_response.json()["id"]

    # Update the robot
    response = client.patch(
        f"/robot?robot_id={robot_id}", json=PATCH_DATA_INVALID_FIELD
    )
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Extra inputs are not permitted"
