package repository

import (
	"fmt"
	"log"
	"time"

	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/config"
	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/models"
	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/pkg/dto"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type TelemetryRepository struct {
	db *gorm.DB
}

// NewTelemetryRepository creates a new repository with database connection
func NewTelemetryRepository(cfg *config.DatabaseConfig) *TelemetryRepository {
	// Construct DSN
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode)

	log.Println("Connecting to database...")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := db.AutoMigrate(&models.Telemetry{}); err != nil {
		log.Fatal("Failed to migrate database schema:", err)
	}

	log.Println("Databse connected and migrated successfully")
	return &TelemetryRepository{
		db: db,
	}
}

// InsertTelemetry adds a new telemetry record to the database
func (r *TelemetryRepository) InsertTelemetry(t models.Telemetry) error {
	result := r.db.Create(&t)
	if result.Error != nil {
		log.Println("Failed to insert telemetry:", result.Error)
		return result.Error
	}

	return nil
}

// GetTelemetry retrieves all telemetry entries within a time range
func (r *TelemetryRepository) GetTelemetry(startTime, endTime time.Time) ([]models.Telemetry, error) {
	var telemetry []models.Telemetry
	result := r.db.Where("timestamp BETWEEN ? AND ?", startTime, endTime).Find(&telemetry)
	return telemetry, result.Error
}

// GetLatestTelemetry retrieves the most recent telemetry entry
func (r *TelemetryRepository) GetLatestTelemetry() (models.Telemetry, error) {
	var telemetry models.Telemetry
	result := r.db.Order("timestamp DESC").First(&telemetry)
	return telemetry, result.Error
}

// GetAnomalies retrieves all anomalous telemetry entries within a time range
func (r *TelemetryRepository) GetAnomalies(startTime, endTime time.Time) ([]models.Telemetry, error) {
	var anomalies []models.Telemetry
	result := r.db.Where("timestamp BETWEEN ? AND ? AND anomaly = ?", startTime, endTime, true).Find(&anomalies)
	return anomalies, result.Error
}

// GetAggregatedTelemetry computes statistics for telemetry data
func (r *TelemetryRepository) GetAggregatedTelemetry(startTime, endTime time.Time) (dto.AggregatedTelemetry, error) {
	var agg dto.AggregatedTelemetry
	query := `
        SELECT 
            MIN(temperature) AS min_temperature, MAX(temperature) AS max_temperature, AVG(temperature) AS avg_temperature,
            MIN(battery) AS min_battery, MAX(battery) AS max_battery, AVG(battery) AS avg_battery,
            MIN(altitude) AS min_altitude, MAX(altitude) AS max_altitude, AVG(altitude) AS avg_altitude,
            MIN(signal) AS min_signal, MAX(signal) AS max_signal, AVG(signal) AS avg_signal
        FROM telemetries
        WHERE timestamp BETWEEN ? AND ?
    `
	result := r.db.Raw(query, startTime, endTime).Scan(&agg)
	return agg, result.Error
}
