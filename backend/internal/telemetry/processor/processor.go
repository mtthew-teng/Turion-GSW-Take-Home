package processor

import (
	"bytes"
	"encoding/binary"
	"time"

	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/models"
)

// TelemetryProcessor processes CCSDS telemetry packets
type TelemetryProcessor struct{}

// NewTelemetryProcessor creates a new processor instance
func NewTelemetryProcessor() *TelemetryProcessor {
	return &TelemetryProcessor{}
}

// ProcessPacket decodes a CCSDS packet and returns a telemetry model
func (p *TelemetryProcessor) ProcessPacket(data []byte) (models.Telemetry, error) {
	reader := bytes.NewReader(data)

	// Decode headers and payload
	primaryHeader := models.CCSDSPrimaryHeader{}
	secondaryHeader := models.CCSDSSecondaryHeader{}
	payload := models.TelemetryPayload{}

	if err := binary.Read(reader, binary.BigEndian, &primaryHeader); err != nil {
		return models.Telemetry{}, err
	}

	if err := binary.Read(reader, binary.BigEndian, &secondaryHeader); err != nil {
		return models.Telemetry{}, err
	}

	if err := binary.Read(reader, binary.BigEndian, &payload); err != nil {
		return models.Telemetry{}, err
	}

	// Convert timestamp
	timestamp := time.Unix(int64(secondaryHeader.Timestamp), 0)

	// Check for anomalies
	anomalyFlags := p.DetectAnomalies(payload)

	// Create telemetry record
	telemetry := models.Telemetry{
		Timestamp:    timestamp,
		Temperature:  payload.Temperature,
		Battery:      payload.Battery,
		Altitude:     payload.Altitude,
		Signal:       payload.Signal,
		AnomalyFlags: anomalyFlags,
	}

	return telemetry, nil
}

// DetectAnomalies checks telemetry values against defined thresholds and returns bitwise flags
func (p *TelemetryProcessor) DetectAnomalies(payload models.TelemetryPayload) uint8 {
	var flags uint8 = 0

	if payload.Temperature > 35.0 {
		flags |= models.TemperatureAnomaly
	}
	if payload.Battery < 40.0 {
		flags |= models.BatteryAnomaly
	}
	if payload.Altitude < 400.0 {
		flags |= models.AltitudeAnomaly
	}
	if payload.Signal < -80.0 {
		flags |= models.SignalAnomaly
	}

	return flags
}
