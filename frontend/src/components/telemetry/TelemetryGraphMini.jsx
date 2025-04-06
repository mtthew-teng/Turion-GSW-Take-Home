import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MAX_ENTRIES = 20;

const TelemetryGraphMini = ({ initialData, latestTelemetry, loading, error, dataKey, unit, title = dataKey }) => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  useEffect(() => {
    setErrorMessage(error);
  }, [error]);

  // Set initial data when available
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setTelemetryData(initialData);
      setIsLoading(false);
    }
  }, [initialData]);

  // Push new entry to the END
  useEffect(() => {
    if (!latestTelemetry) return;

    setTelemetryData((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].Timestamp === latestTelemetry.Timestamp) {
        return prev; // Avoid duplicates
      }

      const updated = [...prev.slice(-MAX_ENTRIES + 1), latestTelemetry];
      return updated;
    });
    
    setIsLoading(false);
  }, [latestTelemetry]);


  return (
    <div>TelemetryGraphMini</div>
  )
}

export default TelemetryGraphMini