package config

import (
	"os"
	"strconv"

	"gopkg.in/yaml.v3"
)

type Config struct {
	AgentID              string             `yaml:"agent_id"`
	ShipID               string             `yaml:"ship_id"`
	ServerURL            string             `yaml:"server_url"`
	APIKey               string             `yaml:"api_key"`
	FlushIntervalSeconds int                `yaml:"flush_interval_seconds"`
	MaxBatchSize         int                `yaml:"max_batch_size"`
	EnableMTLS           bool               `yaml:"enable_mtls"`
	Certificates         *CertificateConfig `yaml:"certificates,omitempty"`
	Connectors           []ConnectorConfig  `yaml:"connectors"`
}

type CertificateConfig struct {
	CertFile string `yaml:"cert_file"`
	KeyFile  string `yaml:"key_file"`
	CAFile   string `yaml:"ca_file"`
}

type ConnectorConfig struct {
	Name     string                 `yaml:"name"`
	Type     string                 `yaml:"type"`
	Enabled  bool                   `yaml:"enabled"`
	Schedule string                 `yaml:"schedule"`
	Config   map[string]interface{} `yaml:"config"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	// Override with environment variables if present
	if val := os.Getenv("AGENT_ID"); val != "" {
		config.AgentID = val
	}
	if val := os.Getenv("SHIP_ID"); val != "" {
		config.ShipID = val
	}
	if val := os.Getenv("SERVER_URL"); val != "" {
		config.ServerURL = val
	}
	if val := os.Getenv("API_KEY"); val != "" {
		config.APIKey = val
	}
	if val := os.Getenv("FLUSH_INTERVAL_SECONDS"); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			config.FlushIntervalSeconds = intVal
		}
	}
	if val := os.Getenv("MAX_BATCH_SIZE"); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			config.MaxBatchSize = intVal
		}
	}
	if val := os.Getenv("ENABLE_MTLS"); val != "" {
		if boolVal, err := strconv.ParseBool(val); err == nil {
			config.EnableMTLS = boolVal
		}
	}

	// Set defaults
	if config.FlushIntervalSeconds == 0 {
		config.FlushIntervalSeconds = 300 // 5 minutes
	}
	if config.MaxBatchSize == 0 {
		config.MaxBatchSize = 100
	}

	return &config, nil
}