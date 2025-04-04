export const TEMPERATURE_ANOMALY = 1;  // 1 << 0
export const BATTERY_ANOMALY = 2;      // 1 << 1
export const ALTITUDE_ANOMALY = 4;     // 1 << 2
export const SIGNAL_ANOMALY = 8;       // 1 << 3

// Helper functions
export const hasTemperatureAnomaly = (flags) => (flags & TEMPERATURE_ANOMALY) !== 0;
export const hasBatteryAnomaly = (flags) => (flags & BATTERY_ANOMALY) !== 0;
export const hasAltitudeAnomaly = (flags) => (flags & ALTITUDE_ANOMALY) !== 0;
export const hasSignalAnomaly = (flags) => (flags & SIGNAL_ANOMALY) !== 0;