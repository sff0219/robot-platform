import axios from "axios";
import type {
  Robot,
  AddRobotRequest,
  UpdateRobotRequest,
} from "../types/robot";

const robotApi = axios.create({
  baseURL: "/api/robot",
});

const prometheusApi = axios.create({
  baseURL: "/api/prometheus",
});

const lokiApi = axios.create({
  baseURL: "/api/loki",
});

// Robot Service APIs
export const getRobots = async (): Promise<Robot[]> => {
  const response = await robotApi.get("/robots");
  return response.data;
};

export const addRobot = async (request: AddRobotRequest): Promise<Robot> => {
  const response = await robotApi.post("/robots", request);
  return response.data;
};

export const updateRobot = async (
  id: string,
  request: UpdateRobotRequest
): Promise<Robot> => {
  const response = await robotApi.patch(`/robot?robot_id=${id}`, request);
  return response.data;
};

// Prometheus APIs
export const queryRangeMetrics = async (
  query: string,
  start: string,
  end: string,
  step: string
) => {
  const response = await prometheusApi.get("/api/v1/query_range", {
    params: {
      query,
      start,
      end,
      step,
    },
  });
  return response.data;
};

export const fetchAllMetricNames = async (): Promise<string[]> => {
  const response = await prometheusApi.get("/api/v1/label/__name__/values");
  if (response.status != 200) throw new Error("Failed to fetch metric names");
  return response.data.data;
};

// Loki APIs
export const queryLogs = async (
  query: string,
  start?: number,
  end?: number,
  limit?: number
) => {
  const response = await lokiApi.get("/query_range", {
    params: {
      query,
      start,
      end,
      limit,
      direction: "backward",
    },
  });
  return response.data;
};

export const getLokiLabels = async () => {
  const response = await lokiApi.get("/labels");
  return response.data;
};

export const getLokiLabelValues = async (label: string) => {
  const response = await lokiApi.get(`/label/${label}/values`);
  return response.data;
};
