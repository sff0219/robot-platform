import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Update as UpdateIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRobots, addRobot, updateRobot } from "../services/api";
import type { AddRobotRequest, UpdateRobotRequest } from "../types/robot";

const STATUS_COLORS: Record<
  string,
  "success" | "error" | "warning" | "default"
> = {
  online: "success",
  offline: "error",
  busy: "warning",
  error: "error",
  idle: "default",
};

export default function Robots() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [newRobotName, setNewRobotName] = useState("");
  const [newRobotType, setNewRobotType] = useState("");
  const [newRobotStatus, setNewRobotStatus] = useState("");
  const [updateRobotID, setUpdateRobotID] = useState("");
  const [updateRobotName, setUpdateRobotName] = useState("");
  const [updateRobotType, setUpdateRobotType] = useState("");
  const [updateRobotStatus, setUpdateRobotStatus] = useState("");
  const queryClient = useQueryClient();

  const {
    data: robots = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["getRobots"],
    queryFn: getRobots,
  });

  const addRobotMutation = useMutation({
    mutationFn: addRobot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getRobots"] });
      setOpenAdd(false);
      setNewRobotName("");
      setNewRobotType("");
      setNewRobotStatus("");
    },
  });

  const updateRobotMutation = useMutation({
    mutationFn: (params: { id: string; request: UpdateRobotRequest }) =>
      updateRobot(params.id, params.request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getRobots"] });
      setOpenUpdate(false);
      setUpdateRobotID("");
      setUpdateRobotName("");
      setUpdateRobotType("");
      setUpdateRobotStatus("");
    },
  });

  const handleAddRobot = () => {
    const trimmedName = newRobotName.trim();
    const trimmedType = newRobotType.trim();
    const trimmedStatus = newRobotStatus.trim();

    if (trimmedName && trimmedType) {
      const payload: AddRobotRequest = { name: trimmedName, type: trimmedType };
      if (trimmedStatus) payload.status = trimmedStatus;
      addRobotMutation.mutate(payload);
    }
  };

  const handleUpdateRobot = () => {
    const trimmedID = updateRobotID.trim();
    const trimmedName = updateRobotName.trim();
    const trimmedType = updateRobotType.trim();
    const trimmedStatus = updateRobotStatus.trim();

    const payload: UpdateRobotRequest = {};

    if (trimmedID) {
      if (trimmedName) payload.name = trimmedName;
      if (trimmedType) payload.type = trimmedType;
      if (trimmedStatus) payload.status = trimmedStatus;

      updateRobotMutation.mutate({
        id: trimmedID,
        request: payload,
      });
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading robots: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Robots</Typography>
        <Box>
          <IconButton
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["robots"] })
            }
            sx={{ mr: 2 }}
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            sx={{ mr: 2 }}
          >
            Add Robot
          </Button>
          <Button
            variant="contained"
            startIcon={<UpdateIcon />}
            onClick={() => setOpenUpdate(true)}
          >
            Update Robot
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {robots.map((robot) => (
              <TableRow key={robot.id}>
                <TableCell>{robot.id}</TableCell>
                <TableCell>{robot.name}</TableCell>
                <TableCell>{robot.type}</TableCell>
                <TableCell>
                  <Chip
                    label={robot.status}
                    color={STATUS_COLORS[robot.status] || "default"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New Robot</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              label="Robot Name"
              fullWidth
              value={newRobotName}
              onChange={(e) => setNewRobotName(e.target.value)}
            />
            <TextField
              autoFocus
              label="Robot Type"
              fullWidth
              value={newRobotType}
              onChange={(e) => setNewRobotType(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="robot-status-label">
                Robot Status (optional)
              </InputLabel>
              <Select
                labelId="robot-status-label"
                id="robot-status"
                label="Robot Status"
                value={newRobotStatus}
                onChange={(e) => setNewRobotStatus(e.target.value)}
              >
                <MenuItem value="idle">Idle</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAdd(false);
              setNewRobotName("");
              setNewRobotType("");
              setNewRobotStatus("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddRobot} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUpdate} onClose={() => setOpenUpdate(false)}>
        <DialogTitle>Update Robot</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              label="Robot ID"
              fullWidth
              value={updateRobotID}
              onChange={(e) => setUpdateRobotID(e.target.value)}
            />
            <TextField
              autoFocus
              label="Robot Name (optional)"
              fullWidth
              value={updateRobotName}
              onChange={(e) => setUpdateRobotName(e.target.value)}
            />
            <TextField
              autoFocus
              label="Robot Type (optional)"
              fullWidth
              value={updateRobotType}
              onChange={(e) => setUpdateRobotType(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="robot-status-label">
                Robot Status (optional)
              </InputLabel>
              <Select
                labelId="robot-status-label"
                id="robot-status"
                label="Robot Status"
                value={updateRobotStatus}
                onChange={(e) => setUpdateRobotStatus(e.target.value)}
              >
                <MenuItem value="idle">Idle</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenUpdate(false);
              setUpdateRobotID("");
              setUpdateRobotName("");
              setUpdateRobotType("");
              setUpdateRobotStatus("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateRobot} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
