package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"edgenetiq-agent/internal/config"
	"edgenetiq-agent/internal/queue"
	"edgenetiq-agent/internal/client"
	"edgenetiq-agent/internal/connectors"
)

const (
	defaultConfigPath = "./config.yaml"
)

func main() {
	var configPath string
	flag.StringVar(&configPath, "config", defaultConfigPath, "Path to configuration file")
	flag.Parse()

	// Load configuration
	cfg, err := config.Load(configPath)
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	log.Printf("Starting EdgeNetIQ Agent (ID: %s, Ship: %s)", cfg.AgentID, cfg.ShipID)

	// Initialize SQLite queue
	queue, err := queue.NewSQLiteQueue("./queue.db")
	if err != nil {
		log.Fatalf("Failed to initialize queue: %v", err)
	}
	defer queue.Close()

	// Initialize HTTP client
	httpClient := client.NewHTTPClient(cfg)

	// Initialize connector manager
	connectorManager := connectors.NewManager(cfg, queue)

	// Start connectors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := connectorManager.Start(ctx); err != nil {
		log.Fatalf("Failed to start connectors: %v", err)
	}

	// Start data flusher
	flushTicker := time.NewTicker(time.Duration(cfg.FlushIntervalSeconds) * time.Second)
	defer flushTicker.Stop()

	go func() {
		for {
			select {
			case <-flushTicker.C:
				if err := flushData(queue, httpClient, cfg); err != nil {
					log.Printf("Error flushing data: %v", err)
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	log.Println("Agent started successfully. Press Ctrl+C to stop.")
	<-sigChan

	log.Println("Shutting down agent...")
	cancel()

	// Final flush before shutdown
	if err := flushData(queue, httpClient, cfg); err != nil {
		log.Printf("Error during final flush: %v", err)
	}

	log.Println("Agent stopped")
}

func flushData(q *queue.SQLiteQueue, client *client.HTTPClient, cfg *config.Config) error {
	messages, err := q.GetBatch(cfg.MaxBatchSize)
	if err != nil {
		return err
	}

	if len(messages) == 0 {
		return nil
	}

	log.Printf("Flushing %d messages to server", len(messages))

	if err := client.SendBatch(messages); err != nil {
		log.Printf("Failed to send batch: %v", err)
		// Implement exponential backoff for retries
		return q.RetryMessages(messages)
	}

	// Delete successfully sent messages
	return q.DeleteMessages(messages)
}