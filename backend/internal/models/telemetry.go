package models

import (
	"time"
)

// Anomaly flag constants
const (
	TemperatureAnomaly uint8 = 1 << iota // 1
	BatteryAnomaly                       // 2
	AltitudeAnomaly                      // 4
	SignalAnomaly                        // 8
)

// Telemetry represents a database record for spacecraft telemetry data.
type Telemetry struct {
	ID           uint      `gorm:"primaryKey"` // Unique identifier for the telemetry record
	Timestamp    time.Time `gorm:"not null"`   // Time when the telemetry data was recorded
	Temperature  float32   `gorm:"not null"`   // Temperature in degrees Celsius
	Battery      float32   `gorm:"not null"`   // Battery percentage (0-100%)
	Altitude     float32   `gorm:"not null"`   // Altitude in kilometers
	Signal       float32   `gorm:"not null"`   // Signal strength in decibels (dB)
	AnomalyFlags uint8     `gorm:"not null"`   // Bitwise flags for specific anomalies
}

// Helper methods to check if specific anomaly flags are set
func (t *Telemetry) HasTemperatureAnomaly() bool {
	return t.AnomalyFlags&TemperatureAnomaly != 0
}

func (t *Telemetry) HasBatteryAnomaly() bool {
	return t.AnomalyFlags&BatteryAnomaly != 0
}

func (t *Telemetry) HasAltitudeAnomaly() bool {
	return t.AnomalyFlags&AltitudeAnomaly != 0
}

func (t *Telemetry) HasSignalAnomaly() bool {
	return t.AnomalyFlags&SignalAnomaly != 0
}
