package client

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"edgenetiq-agent/internal/config"
	"edgenetiq-agent/internal/queue"
)

type HTTPClient struct {
	client *http.Client
	config *config.Config
}

type BatchPayload struct {
	AgentID   string           `json:"agent_id"`
	ShipID    string           `json:"ship_id"`
	Messages  []*queue.Message `json:"messages"`
	Timestamp time.Time        `json:"timestamp"`
}

func NewHTTPClient(cfg *config.Config) *HTTPClient {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Configure mTLS if enabled
	if cfg.EnableMTLS && cfg.Certificates != nil {
		tlsConfig := &tls.Config{}

		// Load client certificate and key
		if cfg.Certificates.CertFile != "" && cfg.Certificates.KeyFile != "" {
			cert, err := tls.LoadX509KeyPair(cfg.Certificates.CertFile, cfg.Certificates.KeyFile)
			if err != nil {
				// Log error but continue without client cert
				fmt.Printf("Warning: Failed to load client certificate: %v\n", err)
			} else {
				tlsConfig.Certificates = []tls.Certificate{cert}
			}
		}

		// TODO: Load CA certificate for server verification
		// This is a placeholder - in production, you'd want to load and verify the CA
		if cfg.Certificates.CAFile != "" {
			// tlsConfig.RootCAs = loadCACert(cfg.Certificates.CAFile)
		}

		client.Transport = &http.Transport{
			TLSClientConfig: tlsConfig,
		}
	}

	return &HTTPClient{
		client: client,
		config: cfg,
	}
}

func (c *HTTPClient) SendBatch(messages []*queue.Message) error {
	if len(messages) == 0 {
		return nil
	}

	payload := BatchPayload{
		AgentID:   c.config.AgentID,
		ShipID:    c.config.ShipID,
		Messages:  messages,
		Timestamp: time.Now(),
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal batch payload: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/agent/data", c.config.ServerURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", fmt.Sprintf("EdgeNetIQ-Agent/%s", c.config.AgentID))

	if c.config.APIKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.config.APIKey))
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("server returned error status: %d", resp.StatusCode)
	}

	return nil
}

func (c *HTTPClient) SendHeartbeat() error {
	heartbeat := map[string]interface{}{
		"agent_id":  c.config.AgentID,
		"ship_id":   c.config.ShipID,
		"timestamp": time.Now(),
		"status":    "active",
	}

	jsonData, err := json.Marshal(heartbeat)
	if err != nil {
		return fmt.Errorf("failed to marshal heartbeat: %w", err)
	}

	url := fmt.Sprintf("%s/api/v1/agent/heartbeat", c.config.ServerURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create heartbeat request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.config.APIKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.config.APIKey))
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send heartbeat: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("heartbeat failed with status: %d", resp.StatusCode)
	}

	return nil
}