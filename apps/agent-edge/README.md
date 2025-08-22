# EdgeNetIQ Edge Agent

A lightweight Go agent for collecting ship system data and synchronizing with the EdgeNetIQ platform.

## Features

- **Pluggable Connectors**: Modular architecture supporting SNMP, HTTP, and file-based data collection
- **Offline Queue**: SQLite-based persistent queue with automatic retry and exponential backoff
- **Secure Communication**: Optional mTLS support for secure server communication
- **Scheduled Collection**: Cron-based scheduling for different data collection intervals
- **Configurable Batching**: Efficient data transmission with configurable batch sizes

## Quick Start

### Prerequisites

- Go 1.21 or later
- SQLite3 (for queue persistence)

### Building

```bash
go mod download
go build -o agent ./cmd/agent
```

### Configuration

Copy the example configuration:

```bash
cp config.yaml.example config.yaml
```

Edit `config.yaml` to match your environment:

```yaml
agent_id: "agent-001"
ship_id: "your-ship-id"
server_url: "https://your-edgenetiq-server.com"
api_key: "your-api-key"
```

### Running

```bash
./agent -config config.yaml
```

## Configuration

### Basic Settings

- `agent_id`: Unique identifier for this agent instance
- `ship_id`: Ship identifier this agent is deployed on
- `server_url`: EdgeNetIQ platform API endpoint
- `api_key`: Authentication token for API access
- `flush_interval_seconds`: How often to send queued data (default: 300)
- `max_batch_size`: Maximum messages per batch (default: 100)

### Connectors

#### SNMP Connector

Collects device information via SNMP:

```yaml
- name: "snmp-inventory"
  type: "snmp"
  enabled: true
  schedule: "0 */15 * * * *"  # Every 15 minutes
  config:
    hosts:
      - "192.168.1.10"
      - "192.168.1.11"
    community: "public"
    version: "2c"
```

#### HTTP Connector

Monitors HTTP endpoints for health and metrics:

```yaml
- name: "system-health"
  type: "http"
  enabled: true
  schedule: "0 */5 * * * *"   # Every 5 minutes
  config:
    urls:
      - "http://localhost:8080/health"
    timeout: 10
    max_body_size: 1048576
```

#### File Connector

Monitors log files and configuration changes:

```yaml
- name: "log-monitor"
  type: "file"
  enabled: true
  schedule: "0 * * * * *"     # Every minute
  config:
    paths:
      - "/var/log/ship/engine.log"
    max_file_size: 1048576
```

### Security (mTLS)

For production deployments, enable mutual TLS:

```yaml
enable_mtls: true
certificates:
  cert_file: "/etc/ssl/certs/agent.crt"
  key_file: "/etc/ssl/private/agent.key"
  ca_file: "/etc/ssl/certs/ca.crt"
```

## Environment Variables

Configuration can be overridden with environment variables:

- `AGENT_ID`
- `SHIP_ID`
- `SERVER_URL`
- `API_KEY`
- `FLUSH_INTERVAL_SECONDS`
- `MAX_BATCH_SIZE`
- `ENABLE_MTLS`

## Data Collection

The agent collects various types of data:

### SNMP Data
- System information (uptime, location, contact)
- Interface statistics (bandwidth, errors, status)
- Performance metrics (CPU, memory, disk)

### HTTP Data
- Endpoint health status
- API responses and metrics
- Custom application data

### File Data
- Log file monitoring
- Configuration file changes
- Directory listings

## Queue Management

The agent uses SQLite for reliable data queuing:

- **Persistent**: Data survives agent restarts
- **Retry Logic**: Failed sends are retried with exponential backoff
- **Batching**: Multiple messages sent efficiently in batches

## Monitoring

Check agent status:

```bash
# View queue statistics
sqlite3 queue.db "SELECT COUNT(*) as total_messages FROM queue;"

# View recent activity
tail -f agent.log
```

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check `server_url` and network connectivity
2. **Authentication Failures**: Verify `api_key` is correct
3. **SNMP Timeouts**: Check host accessibility and community strings
4. **File Permission Errors**: Ensure agent has read access to monitored paths

### Debug Mode

Run with verbose logging:

```bash
./agent -config config.yaml -debug
```

### Reset Queue

To clear all queued messages:

```bash
rm queue.db
```

## Production Deployment

### Systemd Service

Create `/etc/systemd/system/edgenetiq-agent.service`:

```ini
[Unit]
Description=EdgeNetIQ Edge Agent
After=network.target

[Service]
Type=simple
User=edgenetiq
WorkingDirectory=/opt/edgenetiq-agent
ExecStart=/opt/edgenetiq-agent/agent -config /etc/edgenetiq-agent/config.yaml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable edgenetiq-agent
sudo systemctl start edgenetiq-agent
```

### Docker Deployment

```bash
docker run -d \
  --name edgenetiq-agent \
  -v /path/to/config.yaml:/app/config.yaml \
  -v /var/log/ship:/var/log/ship:ro \
  edgenetiq/agent:latest
```

## License

MIT License - see LICENSE file for details.