import { useState } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { queryLogs, getLokiLabels, getLokiLabelValues } from "../services/api";

const LOG_LEVELS = ["error", "warn", "info", "debug"];
const LOG_LIMIT = 100;

interface LogEntry {
  timestamp: string;
  message: string;
}

export default function Logs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedPod, setSelectedPod] = useState<string>("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const { data: labels } = useQuery({
    queryKey: ["loki-labels"],
    queryFn: getLokiLabels,
  });

  const { data: services } = useQuery({
    queryKey: ["loki-services"],
    queryFn: () => getLokiLabelValues("app"),
    enabled: !!labels?.data?.includes("app"),
  });

  const { data: pods } = useQuery({
    queryKey: ["loki-pods"],
    queryFn: () => getLokiLabelValues("pod"),
    enabled: !!labels?.data?.includes("pod"),
  });

  const buildLogQuery = () => {
    const labelFilters: string[] = [];
    if (selectedService) labelFilters.push(`app="${selectedService}"`);
    if (selectedPod) labelFilters.push(`pod="${selectedPod}"`);
    const labelSelector = `{${labelFilters.join(",")}}`;

    const regexParts = [];
    if (selectedLevel) {
      regexParts.push(`|~ "${selectedLevel}"`);
    }
    if (searchQuery) {
      regexParts.push(`|~ "${searchQuery}"`);
    }
    const contentFilter =
      regexParts.length > 0 ? `${regexParts.join(" ")}` : "";

    return `${labelSelector} ${contentFilter}`;
  };

  const toNanoSeconds = (date: Date | null): number | undefined => {
    if (!date) return undefined;
    return date.getTime() * 1e6; // milliseconds to nanoseconds
  };

  const { data: logs, refetch } = useQuery({
    queryKey: [
      "logs",
      selectedLevel,
      selectedService,
      searchQuery,
      selectedPod,
      startTime,
      endTime,
    ],
    queryFn: () =>
      queryLogs(
        buildLogQuery(),
        startTime ? toNanoSeconds(startTime) : undefined,
        endTime ? toNanoSeconds(endTime) : undefined,
        LOG_LIMIT
      ),
    refetchInterval: 5000,
  });

  console.log("logs:", logs);

  const parsedLogs: LogEntry[] =
    logs?.data?.result?.[0]?.values?.map(
      ([timestamp, message]: [string, string]) => {
        try {
          const parsed = JSON.parse(message);
          return {
            timestamp,
            message: parsed.log || "",
          };
        } catch {
          return {
            timestamp,
            message,
          };
        }
      }
    ) || [];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Logs</Typography>
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search Logs"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Level</InputLabel>
          <Select
            value={selectedLevel}
            label="Level"
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {LOG_LEVELS.map((level) => (
              <MenuItem key={level} value={level}>
                {level.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Service</InputLabel>
          <Select
            value={selectedService}
            label="Service"
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {services?.data?.map((service: string) => (
              <MenuItem key={service} value={service}>
                {service}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Pod</InputLabel>
          <Select
            value={selectedPod}
            label="Pod"
            onChange={(e) => setSelectedPod(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {pods?.data?.map((pod: string) => (
              <MenuItem key={pod} value={pod}>
                {pod}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Start Time"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
            maxDate={endTime || undefined}
          />
          <DateTimePicker
            label="End Time"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
            minDate={startTime || undefined}
          />
        </LocalizationProvider>
      </Stack>

      <Paper
        sx={{
          p: 2,
          maxHeight: "calc(100vh - 250px)",
          overflow: "auto",
          bgcolor: "grey.900",
        }}
      >
        {parsedLogs.map((log, index) => (
          <Box
            key={index}
            sx={{
              py: 1,
              borderBottom: 1,
              borderColor: "grey.800",
              display: "flex",
              gap: 2,
              fontSize: "0.875rem",
              fontFamily: "monospace",
              color: "grey.300",
            }}
          >
            <Box sx={{ color: "grey.500", whiteSpace: "nowrap" }}>
              {format(
                new Date(parseInt(log.timestamp) / 1e6),
                "yyyy-MM-dd HH:mm:ss.SSS"
              )}
            </Box>

            <Box
              sx={{ flexGrow: 1, wordBreak: "break-all", whiteSpace: "normal" }}
            >
              {log.message}
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
