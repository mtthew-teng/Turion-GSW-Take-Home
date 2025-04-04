import React from "react";
import { FaMountain, FaSignal } from "react-icons/fa";
import { FaTemperatureHalf, FaBatteryHalf } from "react-icons/fa6";
import TelemetryItem from "./TelemetryItem";
import { ToastContainer } from "react-toastify";
import { 
  hasTemperatureAnomaly, 
  hasBatteryAnomaly, 
  hasAltitudeAnomaly, 
  hasSignalAnomaly 
} from "../../utils/anomalyConstants";

const CurrentTelemetry = ({ telemetry, error, loading }) => {
  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-md h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Current Telemetry</h2>
        {telemetry && !loading && !error && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
            {new Date(telemetry.Timestamp).toLocaleString()}
          </span>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="mt-2 text-sm text-gray-500">Loading telemetry data...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex-grow flex items-center justify-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : telemetry ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 flex-grow">
          <TelemetryItem 
            icon={<FaTemperatureHalf />} 
            label="Temperature" 
            value={telemetry.Temperature} 
            unit="°C" 
            hasAnomaly={hasTemperatureAnomaly(telemetry.AnomalyFlags)}
            anomalyType="temperature"
          />
          <TelemetryItem 
            icon={<FaBatteryHalf />} 
            label="Battery" 
            value={telemetry.Battery} 
            unit="%" 
            hasAnomaly={hasBatteryAnomaly(telemetry.AnomalyFlags)}
            anomalyType="battery"
          />
          <TelemetryItem 
            icon={<FaMountain />} 
            label="Altitude" 
            value={telemetry.Altitude} 
            unit="km" 
            hasAnomaly={hasAltitudeAnomaly(telemetry.AnomalyFlags)}
            anomalyType="altitude"
          />
          <TelemetryItem 
            icon={<FaSignal />} 
            label="Signal" 
            value={telemetry.Signal} 
            unit="dB" 
            hasAnomaly={hasSignalAnomaly(telemetry.AnomalyFlags)}
            anomalyType="signal"
          />
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex-grow flex items-center justify-center">
          <p className="text-gray-500">No telemetry data available.</p>
        </div>
      )}
    </div>
  );
};

export default CurrentTelemetry;