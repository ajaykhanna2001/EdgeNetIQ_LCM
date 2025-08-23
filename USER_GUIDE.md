# EdgeNetIQ Platform User Guide

> **Step-by-step instructions for setting up and using the EdgeNetIQ Lifecycle & Calendar Management Platform**

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js 18 or later**: [Download from nodejs.org](https://nodejs.org/)
- **pnpm**: Install with `npm install -g pnpm`
- **Docker Desktop**: [Download from docker.com](https://www.docker.com/products/docker-desktop/)
- **Git**: [Download from git-scm.com](https://git-scm.com/)

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free disk space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/ajaykhanna2001/EdgeNetIQ_LCM.git
cd EdgeNetIQ_LCM
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
pnpm install
```

### Step 3: Start Infrastructure Services

```bash
# Start PostgreSQL, Kafka, and other backend services
make docker-up
```

**Wait 30-60 seconds** for all services to start completely.

### Step 4: Set Up the Database

```bash
# Run database migrations
make migrate

# Seed with sample data
make seed
```

### Step 5: Start the Platform

```bash
# Start both the API and web application
make dev
```

## 🌐 Accessing the Platform

After starting the platform, you can access:

### Web Dashboard
Open your browser and go to: **http://localhost:5173**

The dashboard includes:
- **Fleet Calendar**: View and manage maintenance schedules
- **Asset Drawer**: Browse ship equipment and systems
- **Contract Cockpit**: Manage vendor contracts and licenses
- **Compliance Board**: Track regulatory compliance

### API Documentation
Interactive API docs: **http://localhost:3001/api**

### Calendar Feed (ICS)
Subscribe to calendar: **http://localhost:3001/events/feed.ics**

## 📅 Using the Fleet Calendar

### Viewing Events

1. **Navigate to Calendar**: Click "Fleet Calendar" in the left sidebar
2. **Browse by Month**: Use arrow buttons to change months
3. **Filter Events**: Click "Filters" to filter by ship or event type
4. **View Details**: Click on any event to see full details

### Subscribing to Calendar Feed

1. **Get Feed URL**: Click "Download ICS" button
2. **Copy URL**: Right-click the download and copy link address
3. **Add to Calendar App**:
   - **Outlook**: File → Account Settings → Internet Calendars → New
   - **Google Calendar**: Settings → Add Calendar → From URL
   - **Apple Calendar**: File → New Calendar Subscription

### Sample Events Included

The seed data creates several example events:
- **Monthly Engine Inspection**: 20th of each month
- **Radar Calibration**: Every 3 months
- **Safety Drills**: Monthly fire safety training

## ⚙️ Managing Assets

### Viewing Asset Information

1. Go to **Asset Drawer** from the sidebar
2. **Search Assets**: Use the search bar to find specific equipment
3. **Filter by Status**: Filter by active, maintenance, or decommissioned
4. **View Details**: Click on any asset card for detailed information

### Asset Categories

The platform tracks various asset types:
- **Server**: Engine control units, navigation computers
- **Network**: Radar systems, communication equipment  
- **Storage**: Fuel tanks, cargo systems
- **Security**: Fire suppression, access control
- **Software**: Navigation software, monitoring systems

## 📋 Compliance Tracking

### Viewing Compliance Status

1. Navigate to **Compliance Board**
2. **Review Overview**: Check the summary cards for overall status
3. **Browse by Framework**: Use tabs to view different regulations (SOLAS, MARPOL, etc.)
4. **Check Details**: Click on any control to see assessment details

### Understanding Compliance Status

- **✅ Compliant**: All requirements met, evidence current
- **⚠️ Pending**: Assessment due or in progress
- **❌ Non-Compliant**: Requirements not met, action needed
- **⏰ Overdue**: Assessment past due date

## 🤝 Contract Management

### Viewing Contracts

1. Go to **Contract Cockpit**
2. **Review Summary**: Check total contract value and expiring contracts
3. **Search Contracts**: Use search to find specific vendors or contract types
4. **Sort by Status**: Filter by active, pending, or expired contracts

### Contract Types

- **Software**: Licenses for navigation, monitoring, and business software
- **Hardware**: Equipment purchase and lease agreements
- **Service**: Maintenance, repair, and professional services
- **Support**: Technical support and warranty agreements

## 🔧 Running the Edge Agent

The EdgeNetIQ platform includes a Go-based edge agent for collecting data from ship systems.

### Building the Agent

```bash
# Navigate to agent directory
cd apps/agent-edge

# Build the agent
./build.sh
```

### Configuring the Agent

1. **Copy Configuration**: `cp config.yaml config-production.yaml`
2. **Edit Settings**: Update `config-production.yaml` with your ship details:

```yaml
agent_id: "your-ship-agent-001"
ship_id: "your-ship-id"
server_url: "https://your-edgenetiq-server.com"
api_key: "your-production-api-key"
```

### Running the Agent

```bash
# Run with custom configuration
./agent -config config-production.yaml
```

### Agent Features

- **SNMP Monitoring**: Collects data from network equipment
- **HTTP Health Checks**: Monitors web services and APIs
- **File Monitoring**: Watches log files and configuration changes
- **Offline Queue**: Stores data when network is unavailable
- **Automatic Retry**: Handles network failures gracefully

## 🔄 Common Operations

### Restarting Services

```bash
# Restart all infrastructure services
make restart
```

### Viewing Logs

```bash
# View all service logs
make docker-logs

# View specific service logs
make logs-calendar
make logs-web
```

### Resetting Data

```bash
# Clear all data and start fresh
make migrate-reset
make seed
```

### Backing Up Data

```bash
# Create database backup
make db-backup
```

## 🛠️ Troubleshooting

### Common Issues

#### "Port already in use" error
**Problem**: Another application is using the required ports.
**Solution**: 
```bash
# Stop any conflicting services
docker-compose down
make docker-down

# Try starting again
make docker-up
```

#### Calendar events not showing
**Problem**: Database not seeded or calendar service not running.
**Solution**:
```bash
# Check if services are running
make status

# Reseed database
make seed

# Restart services
make restart
```

#### Edge agent connection fails
**Problem**: Agent cannot connect to calendar service.
**Solution**:
1. Check `server_url` in agent configuration
2. Ensure calendar service is running on port 3001
3. Verify API key is correct

#### Web dashboard shows "Network Error"
**Problem**: Frontend cannot connect to backend API.
**Solution**:
1. Verify calendar service is running: `curl http://localhost:3001/events`
2. Check browser console for CORS errors
3. Restart services: `make restart`

### Getting Help

#### Check Service Status
```bash
# View running services
make status

# Check specific service health
curl http://localhost:3001/events
curl http://localhost:5173
```

#### Review Logs
```bash
# Calendar service logs
make logs-calendar

# Database logs
docker-compose -f docker-compose.dev.yml logs postgres

# All service logs
make docker-logs
```

#### Reset Everything
If you encounter persistent issues:

```bash
# Complete cleanup and restart
make clean
make setup
```

## 📱 Mobile Access

The web dashboard is responsive and works on mobile devices:

1. **Same URL**: Use http://localhost:5173 on mobile browser
2. **Network Access**: Ensure mobile device is on same network as development machine
3. **Alternative**: Use your computer's IP address: http://[YOUR-IP]:5173

## 🔐 Security Notes

**⚠️ Development Only**: This setup is for development and testing only.

For production use, you must:
- [ ] Enable HTTPS/SSL
- [ ] Set up authentication
- [ ] Configure firewalls
- [ ] Use secure passwords
- [ ] Enable audit logging
- [ ] Set up monitoring

## 🆘 Getting Support

### Self-Help Resources

1. **Check this guide** for common solutions
2. **Review logs** using the troubleshooting commands above
3. **Search documentation** in the project README

### Reporting Issues

If you still need help:

1. **Gather Information**:
   - Operating system and version
   - Node.js and Docker versions
   - Error messages and logs
   - Steps to reproduce the issue

2. **Create Issue**: Submit detailed issue on GitHub

3. **Include Context**: 
   - What you were trying to do
   - What happened instead
   - Relevant log output
   - Your configuration (without secrets)

---

**Need immediate help?** Check the main [README](README.md) for additional resources and contact information.