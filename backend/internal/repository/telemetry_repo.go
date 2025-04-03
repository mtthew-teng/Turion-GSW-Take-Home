package repository

import (
	"fmt"
	"log"

	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/config"
	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/models"
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
