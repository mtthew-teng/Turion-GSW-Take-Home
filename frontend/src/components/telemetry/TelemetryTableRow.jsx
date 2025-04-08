import React from "react";

// Import helper functions
import {
  hasTemperatureAnomaly,
  hasBatteryAnomaly,
  hasAltitudeAnomaly,
  hasSignalAnomaly
} from "../../utils/anomalyConstants";

// Create a TableCell component for consistency
const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
    {children}
  </td>
);

const TelemetryTableRow = ({ item, isNewRow }) => {
  // Check if the row has any anomaly
  const hasAnyAnomaly = () => {
    if (!item || item.AnomalyFlags === undefined) return false;
    
    return (
      hasTemperatureAnomaly(item.AnomalyFlags) ||
      hasBatteryAnomaly(item.AnomalyFlags) ||
      hasAltitudeAnomaly(item.AnomalyFlags) ||
      hasSignalAnomaly(item.AnomalyFlags)
    );
  };

  return (
    <tr className={`${hasAnyAnomaly() ? "bg-red-50" : ""} ${isNewRow ? "animate-flash" : ""}`}>
      <TableCell>{new Date(item.Timestamp).toLocaleString()}</TableCell>
      <TableCell>
        <span className={hasTemperatureAnomaly(item.AnomalyFlags) ? "text-red-500 font-medium" : ""}>
          {item.Temperature.toFixed(1)}
        </span>
      </TableCell>
      <TableCell>
        <span className={hasBatteryAnomaly(item.AnomalyFlags) ? "text-amber-500 font-medium" : ""}>
          {item.Battery.toFixed(1)}
        </span>
      </TableCell>
      <TableCell>
        <span className={hasAltitudeAnomaly(item.AnomalyFlags) ? "text-red-500 font-medium" : ""}>
          {item.Altitude.toFixed(1)}
        </span>
      </TableCell>
      <TableCell>
        <span className={hasSignalAnomaly(item.AnomalyFlags) ? "text-amber-500 font-medium" : ""}>
          {item.Signal.toFixed(1)}
        </span>
      </TableCell>
    </tr>
  );
};

export default TelemetryTableRow;