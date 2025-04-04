package main

import (
	"log"
	"sync"

	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/api"
	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/config"
	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/repository"
	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/telemetry"
)

func main() {
	log.Println("Starting Telemetry Services")

	// Load config
	cfg := config.LoadConfig()

	// Initialize database connection
	repo := repository.NewTelemetryRepository(cfg)

	var wg sync.WaitGroup
	wg.Add(2)

	// Start the UDP telemetry server
	go func() {
		defer wg.Done()
		telemetryServer := telemetry.NewTelemetryServer(repo, "8089")
		telemetryServer.Start()
	}()

	// Start the API server
	go func() {
		defer wg.Done()
		apiServer := api.NewAPIServer(repo, "3000")
		apiServer.Start()
	}()

	wg.Wait()
}
