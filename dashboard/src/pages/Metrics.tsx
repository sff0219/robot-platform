import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, subHours } from "date-fns";
import { queryRangeMetrics, fetchAllMetricNames } from "../services/api";

const timeRanges = [
  { label: "Last 1 hour", value: 1 },
  { label: "Last 3 hours", value: 3 },
  { label: "Last 6 hours", value: 6 },
  { label: "Last 12 hours", value: 12 },
  { label: "Last 24 hours", value: 24 },
];

export default function Metrics() {
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [timeRange, setTimeRange] = useState(1);

  const end = new Date();
  const start = subHours(end, timeRange);
  const step = Math.max(timeRange * 60, 300); // At least 5 minutes between points

  const { data: metricNames = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ["allMetricNames"],
    queryFn: fetchAllMetricNames,
  });

  const { data: metricData } = useQuery({
    enabled: !!selectedMetric,
    queryKey: ["queryRangeMetrics", selectedMetric, timeRange],
    queryFn: () =>
      queryRangeMetrics(
        selectedMetric,
        Math.floor(start.getTime() / 1000).toString(),
        Math.floor(end.getTime() / 1000).toString(),
        step.toString()
      ),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatData = (data: any[]) => {
    if (!data?.length) return [];

    const timestamps = new Set<number>();
    const seriesMap = new Map<string, { [key: string]: number }>();

    data.forEach((series) => {
      const name = series.metric?.status || "value";
      series.values.forEach(([time, value]: [number, string]) => {
        timestamps.add(time);
        if (!seriesMap.has(time.toString())) {
          seriesMap.set(time.toString(), {});
        }
        seriesMap.get(time.toString())![name] = parseFloat(value);
      });
    });

    return Array.from(timestamps)
      .sort()
      .map((time) => ({
        time: format(new Date(time * 1000), "HH:mm"),
        ...seriesMap.get(time.toString()),
      }));
  };

  const formattedData = formatData(metricData?.data?.result || []);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ mr: 2 }}>
          Metrics
        </Typography>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            {timeRanges.map((range) => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 500, mr: 2 }}>
          <InputLabel>Metric</InputLabel>
          <Select
            value={selectedMetric}
            label="Metric"
            onChange={(e) => setSelectedMetric(e.target.value)}
            disabled={loadingMetrics}
          >
            {metricNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {formattedData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedMetric}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  {Object.keys(formattedData[0] || {})
                    .filter((key) => key !== "time")
                    .map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={`hsl(${(i * 137.5) % 360}, 70%, 50%)`}
                        dot={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
