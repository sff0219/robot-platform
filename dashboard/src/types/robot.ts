export interface Robot {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface AddRobotRequest {
  name: string;
  type: string;
  status?: string;
}

export interface UpdateRobotRequest {
  name?: string;
  type?: string;
  status?: string;
}
