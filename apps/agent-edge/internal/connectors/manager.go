package connectors

import (
	"context"
	"fmt"
	"log"

	"edgenetiq-agent/internal/config"
	"edgenetiq-agent/internal/queue"
	"github.com/robfig/cron/v3"
)

// Connector interface defines the contract for all data collectors
type Connector interface {
	Name() string
	Type() string
	Collect(ctx context.Context) (interface{}, error)
}

// Manager handles multiple connectors and their scheduling
type Manager struct {
	config     *config.Config
	queue      *queue.SQLiteQueue
	connectors map[string]Connector
	cron       *cron.Cron
}

func NewManager(cfg *config.Config, q *queue.SQLiteQueue) *Manager {
	return &Manager{
		config:     cfg,
		queue:      q,
		connectors: make(map[string]Connector),
		cron:       cron.New(),
	}
}

func (m *Manager) Start(ctx context.Context) error {
	// Initialize connectors based on configuration
	for _, connectorCfg := range m.config.Connectors {
		if !connectorCfg.Enabled {
			continue
		}

		connector, err := m.createConnector(connectorCfg)
		if err != nil {
			log.Printf("Failed to create connector %s: %v", connectorCfg.Name, err)
			continue
		}

		m.connectors[connectorCfg.Name] = connector

		// Schedule connector execution
		if connectorCfg.Schedule != "" {
			_, err := m.cron.AddFunc(connectorCfg.Schedule, func() {
				m.collectAndQueue(ctx, connector)
			})
			if err != nil {
				log.Printf("Failed to schedule connector %s: %v", connectorCfg.Name, err)
				continue
			}
		}

		log.Printf("Started connector: %s (type: %s, schedule: %s)", 
			connector.Name(), connector.Type(), connectorCfg.Schedule)
	}

	m.cron.Start()
	return nil
}

func (m *Manager) Stop() {
	m.cron.Stop()
}

func (m *Manager) createConnector(cfg config.ConnectorConfig) (Connector, error) {
	switch cfg.Type {
	case "snmp":
		return NewSNMPInventoryConnector(cfg)
	case "http":
		return NewHTTPConnector(cfg)
	case "file":
		return NewFileConnector(cfg)
	default:
		return nil, fmt.Errorf("unknown connector type: %s", cfg.Type)
	}
}

func (m *Manager) collectAndQueue(ctx context.Context, connector Connector) {
	log.Printf("Collecting data from connector: %s", connector.Name())

	data, err := connector.Collect(ctx)
	if err != nil {
		log.Printf("Error collecting data from %s: %v", connector.Name(), err)
		return
	}

	if err := m.queue.Enqueue(connector.Name(), data); err != nil {
		log.Printf("Error queuing data from %s: %v", connector.Name(), err)
		return
	}

	log.Printf("Successfully queued data from connector: %s", connector.Name())
}