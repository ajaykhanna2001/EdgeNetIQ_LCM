package connectors

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"edgenetiq-agent/internal/config"
)

// HTTPConnector collects data from HTTP endpoints
type HTTPConnector struct {
	name   string
	config map[string]interface{}
	client *http.Client
}

type HTTPData struct {
	URL        string            `json:"url"`
	Timestamp  time.Time         `json:"timestamp"`
	StatusCode int               `json:"status_code"`
	Headers    map[string]string `json:"headers"`
	Body       json.RawMessage   `json:"body,omitempty"`
	Error      string            `json:"error,omitempty"`
	Metadata   map[string]string `json:"metadata"`
}

func NewHTTPConnector(cfg config.ConnectorConfig) (*HTTPConnector, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	return &HTTPConnector{
		name:   cfg.Name,
		config: cfg.Config,
		client: client,
	}, nil
}

func (c *HTTPConnector) Name() string {
	return c.name
}

func (c *HTTPConnector) Type() string {
	return "http"
}

func (c *HTTPConnector) Collect(ctx context.Context) (interface{}, error) {
	urls, ok := c.config["urls"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("urls configuration is required for HTTP connector")
	}

	var results []HTTPData

	for _, urlInterface := range urls {
		url, ok := urlInterface.(string)
		if !ok {
			continue
		}

		data := c.collectFromURL(ctx, url)
		results = append(results, data)
	}

	return results, nil
}

func (c *HTTPConnector) collectFromURL(ctx context.Context, url string) HTTPData {
	data := HTTPData{
		URL:       url,
		Timestamp: time.Now(),
		Headers:   make(map[string]string),
		Metadata: map[string]string{
			"collector_version": "1.0.0",
			"user_agent":        "EdgeNetIQ-Agent/1.0",
		},
	}

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		data.Error = fmt.Sprintf("failed to create request: %v", err)
		return data
	}

	// Add authentication if configured
	if username, ok := c.config["username"].(string); ok {
		if password, ok := c.config["password"].(string); ok {
			req.SetBasicAuth(username, password)
		}
	}

	// Add custom headers if configured
	if headers, ok := c.config["headers"].(map[string]interface{}); ok {
		for key, value := range headers {
			if valueStr, ok := value.(string); ok {
				req.Header.Set(key, valueStr)
			}
		}
	}

	resp, err := c.client.Do(req)
	if err != nil {
		data.Error = fmt.Sprintf("request failed: %v", err)
		return data
	}
	defer resp.Body.Close()

	data.StatusCode = resp.StatusCode

	// Capture response headers
	for key, values := range resp.Header {
		if len(values) > 0 {
			data.Headers[key] = values[0]
		}
	}

	// Read response body (with size limit)
	maxBodySize := int64(1024 * 1024) // 1MB limit
	if maxSize, ok := c.config["max_body_size"].(int); ok {
		maxBodySize = int64(maxSize)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, maxBodySize))
	if err != nil {
		data.Error = fmt.Sprintf("failed to read response body: %v", err)
		return data
	}

	// Try to parse as JSON, otherwise store as raw text
	var jsonBody json.RawMessage
	if json.Unmarshal(body, &jsonBody) == nil {
		data.Body = jsonBody
	} else {
		// Store as JSON string for non-JSON responses
		bodyStr, _ := json.Marshal(string(body))
		data.Body = bodyStr
	}

	return data
}