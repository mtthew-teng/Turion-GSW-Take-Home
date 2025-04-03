package main

import (
	"log"

	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/config"
	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/repository"
)

func main() {
	log.Println("Starting Telemetry Services")

	// Load config
	cfg := config.LoadConfig()

	// Initialize database connection
	repo := repository.NewTelemetryRepository(cfg)
}
