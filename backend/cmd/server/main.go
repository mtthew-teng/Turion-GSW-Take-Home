package main

import (
	"log"

	"github.com/mtthew-teng/Turion-GSW-Take-Home/backend/internal/config"
)

func main() {
	log.Println("Starting Telemetry Services")

	// Load config
	cfg := config.LoadConfig()

	log.Println(cfg)
}
