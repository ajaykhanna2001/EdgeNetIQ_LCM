package connectors

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"edgenetiq-agent/internal/config"
)

// FileConnector monitors files and directories for changes
type FileConnector struct {
	name   string
	config map[string]interface{}
}

type FileData struct {
	Path      string            `json:"path"`
	Timestamp time.Time         `json:"timestamp"`
	Size      int64             `json:"size"`
	ModTime   time.Time         `json:"mod_time"`
	IsDir     bool              `json:"is_dir"`
	Content   string            `json:"content,omitempty"`
	Error     string            `json:"error,omitempty"`
	Metadata  map[string]string `json:"metadata"`
}

func NewFileConnector(cfg config.ConnectorConfig) (*FileConnector, error) {
	return &FileConnector{
		name:   cfg.Name,
		config: cfg.Config,
	}, nil
}

func (c *FileConnector) Name() string {
	return c.name
}

func (c *FileConnector) Type() string {
	return "file"
}

func (c *FileConnector) Collect(ctx context.Context) (interface{}, error) {
	paths, ok := c.config["paths"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("paths configuration is required for file connector")
	}

	var results []FileData

	for _, pathInterface := range paths {
		path, ok := pathInterface.(string)
		if !ok {
			continue
		}

		data := c.collectFromPath(path)
		results = append(results, data)
	}

	return results, nil
}

func (c *FileConnector) collectFromPath(path string) FileData {
	data := FileData{
		Path:      path,
		Timestamp: time.Now(),
		Metadata: map[string]string{
			"collector_version": "1.0.0",
		},
	}

	info, err := os.Stat(path)
	if err != nil {
		data.Error = fmt.Sprintf("failed to stat file: %v", err)
		return data
	}

	data.Size = info.Size()
	data.ModTime = info.ModTime()
	data.IsDir = info.IsDir()

	// Read file content if it's a file and not too large
	if !info.IsDir() {
		maxSize := int64(1024 * 1024) // 1MB default
		if maxSizeInterface, ok := c.config["max_file_size"]; ok {
			if maxSizeInt, ok := maxSizeInterface.(int); ok {
				maxSize = int64(maxSizeInt)
			}
		}

		if info.Size() <= maxSize {
			content, err := os.ReadFile(path)
			if err != nil {
				data.Error = fmt.Sprintf("failed to read file content: %v", err)
			} else {
				data.Content = string(content)
			}
		} else {
			data.Metadata["content_skipped"] = "file too large"
		}
	} else {
		// For directories, list contents
		entries, err := os.ReadDir(path)
		if err != nil {
			data.Error = fmt.Sprintf("failed to read directory: %v", err)
		} else {
			var fileNames []string
			for _, entry := range entries {
				fileNames = append(fileNames, entry.Name())
			}
			data.Metadata["directory_entries"] = fmt.Sprintf("%d files", len(fileNames))
		}
	}

	// Add file extension metadata
	if !info.IsDir() {
		ext := filepath.Ext(path)
		if ext != "" {
			data.Metadata["file_extension"] = ext
		}
	}

	return data
}