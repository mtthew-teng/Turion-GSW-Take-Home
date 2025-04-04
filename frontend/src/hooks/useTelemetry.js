// src/hooks/useTelemetry.js
import { useState, useEffect } from "react";
import { getCurrentTelemetry, subscribeTelemetry } from "../services/telemetryService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  hasTemperatureAnomaly,
  hasBatteryAnomaly,
  hasAltitudeAnomaly,
  hasSignalAnomaly
} from "../utils/anomalyConstants";

const useTelemetry = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, get the current telemetry
    const fetchInitialTelemetry = async () => {
      try {
        const data = await getCurrentTelemetry();
        
        if (!data || Object.keys(data).length === 0) {
          throw new Error("API returned empty data");
        }

        // Check for anomalies and trigger notifications
        checkForAnomalies(data);

        setTelemetry(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching initial telemetry:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchInitialTelemetry();

    // Then, subscribe to WebSocket updates
    const unsubscribe = subscribeTelemetry((newTelemetry) => {
      setTelemetry(newTelemetry);
      checkForAnomalies(newTelemetry);
    });

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const checkForAnomalies = (data) => {
    // Only show notifications if AnomalyFlags exists and is valid
    if (!data || typeof data.AnomalyFlags !== 'number') return;
    
    if (hasTemperatureAnomaly(data.AnomalyFlags)) {
      toast.error(`High Temperature Alert: ${data.Temperature.toFixed(1)}°C`);
    }
    
    if (hasBatteryAnomaly(data.AnomalyFlags)) {
      toast.warn(`Low Battery Alert: ${data.Battery.toFixed(1)}%`);
    }
    
    if (hasAltitudeAnomaly(data.AnomalyFlags)) {
      toast.error(`Low Altitude Alert: ${data.Altitude.toFixed(1)} km`);
    }
    
    if (hasSignalAnomaly(data.AnomalyFlags)) {
      toast.warn(`Weak Signal Alert: ${data.Signal.toFixed(1)} dB`);
    }
  };

  return { telemetry, error, loading };
};

export default useTelemetry;