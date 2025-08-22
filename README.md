# EdgeNetIQ Lifecycle & Calendar Management Platform

> **⚠️ Development Preview**: This is a development scaffold for the EdgeNetIQ platform. Not intended for production use without proper security hardening.

A comprehensive fleet management platform designed specifically for maritime operations, combining asset lifecycle management, compliance tracking, and intelligent calendar scheduling in one integrated solution.

## 🌟 What EdgeNetIQ Does for You

EdgeNetIQ transforms how maritime organizations manage their fleet operations by providing:

### 📅 **Smart Fleet Calendar**
- **Never Miss Critical Maintenance**: Automated scheduling with conflict detection ensures your maintenance windows don't overlap
- **Real-time Coordination**: See all fleet activities across multiple ships in one unified calendar view
- **Compliance Integration**: Maintenance schedules automatically align with regulatory requirements
- **Export & Share**: Download ICS calendar feeds to integrate with your existing planning tools

### ⚙️ **Asset Lifecycle Management** 
- **Know Before It Breaks**: Track all ship equipment from installation to retirement
- **End-of-Life Alerts**: Get notified 90 days before critical systems reach end-of-support
- **Maintenance History**: Complete audit trail of all service activities and repairs
- **Risk Scoring**: Prioritize attention based on criticality, age, and compliance gaps

### 📋 **Compliance Automation**
- **Multi-Framework Support**: Track compliance across SOLAS, MARPOL, ISM, and custom frameworks
- **Evidence Management**: Centralized storage for certificates, inspection reports, and documentation
- **Audit Readiness**: Generate compliance reports for port state control and class surveys
- **Automated Reminders**: Never miss a compliance deadline again

### 🤝 **Contract & License Optimization**
- **Cost Visibility**: Track all vendor contracts and software licenses in one place
- **Renewal Management**: Automated alerts for upcoming contract expirations
- **Usage Monitoring**: Optimize license utilization to reduce unnecessary costs
- **Vendor Performance**: Track service quality and response times

## 🏗️ Platform Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ship Systems  │    │   Ship Systems  │    │   Ship Systems  │
│                 │    │                 │    │                 │
│  ┌─────────────┐│    │  ┌─────────────┐│    │  ┌─────────────┐│
│  │Edge Agent   ││    │  │Edge Agent   ││    │  │Edge Agent   ││
│  │• SNMP       ││    │  │• HTTP APIs  ││    │  │• Log Files  ││
│  │• Sensors    ││    │  │• Databases  ││    │  │• Custom     ││
│  │• Files      ││    │  │• IoT        ││    │  │  Connectors ││
│  └─────────────┘│    │  └─────────────┘│    │  └─────────────┘│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │   EdgeNetIQ Cloud   │
                    │                     │
                    │  📅 Calendar API    │
                    │  ⚙️  Lifecycle API   │
                    │  📋 Compliance API  │
                    │  🤝 Contract API    │
                    │                     │
                    │  🌐 Web Dashboard   │
                    │  📱 Mobile App      │
                    │  🔗 Integrations    │
                    └─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Docker and Docker Compose
- Git

### 1️⃣ **Setup**
```bash
git clone https://github.com/ajaykhanna2001/EdgeNetIQ_LCM.git
cd EdgeNetIQ_LCM
make setup
```

### 2️⃣ **Start Development Environment**
```bash
make start
```

### 3️⃣ **Access the Platform**
- **Web Dashboard**: http://localhost:5173
- **API Documentation**: http://localhost:3001/api
- **Calendar Feed**: http://localhost:3001/events/feed.ics

See the [User Guide](USER_GUIDE.md) for detailed step-by-step instructions.

## 📦 What's Included

### **Core Services**
- **Calendar Service**: Full-featured scheduling with RRULE recurrence and conflict detection
- **Lifecycle Service**: Asset management and EOSL tracking *(coming soon)*
- **License Service**: Contract and license management *(coming soon)*
- **Compliance Service**: Multi-framework compliance tracking *(coming soon)*
- **CMDB Service**: Configuration management database *(coming soon)*

### **Web Application**
- **Fleet Calendar**: Visual calendar with filtering and ICS export
- **Asset Drawer**: Equipment inventory and status tracking *(preview)*
- **Contract Cockpit**: Vendor and license management *(preview)*
- **Compliance Board**: Regulatory compliance dashboard *(preview)*

### **Edge Agent** (Go)
- **Pluggable Connectors**: SNMP, HTTP, and file-based data collection
- **Offline Queue**: SQLite-based persistence with retry logic
- **Secure Communication**: Optional mTLS support
- **Scheduled Collection**: Cron-based data gathering

### **Infrastructure**
- **PostgreSQL**: Primary database with comprehensive schema
- **Apache Kafka**: Event streaming and system integration
- **Neo4j**: Graph database for asset relationships *(ready for use)*
- **MinIO**: Object storage for documents and evidence *(ready for use)*
- **Redis**: Caching and session management

## 🔧 Key Features Implemented

### ✅ **Production-Ready Components**
- **Complete Calendar Service**: Create, update, delete events with full RRULE support
- **Conflict Detection**: Automatic detection of scheduling conflicts and blackout windows
- **ICS Export**: Standard calendar format for integration with Outlook, Google Calendar, etc.
- **Risk Scoring**: Configurable risk assessment based on multiple factors
- **Unit Tests**: Comprehensive test coverage for calendar functionality
- **API Documentation**: Complete OpenAPI specifications
- **Database Migrations**: Prisma-based schema management

### 🔄 **Event Streaming Ready**
- **Kafka Integration**: Event schemas defined for all platform events
- **Webhook Support**: Outbound notifications for system integration
- **RBAC System**: Role-based access control with 5 predefined roles

### 📊 **Monitoring & Observability**
- **Health Checks**: Service health monitoring
- **Rate Limiting**: API protection and throttling
- **Logging**: Structured logging throughout the platform
- **OpenTelemetry**: Tracing support *(ready for configuration)*

## 🔐 Security Considerations

**⚠️ Important**: This is a development scaffold. Before production use:

- [ ] Enable authentication and authorization
- [ ] Configure HTTPS/TLS for all services
- [ ] Set up proper secrets management
- [ ] Enable audit logging
- [ ] Configure firewall and network security
- [ ] Set up backup and disaster recovery
- [ ] Perform security testing and code review

## 🤝 Contributing

This platform is designed to be extensible. Key extension points:

- **New Connectors**: Add edge agent connectors for additional data sources
- **Custom Services**: Add new microservices following the established patterns
- **UI Components**: Extend the React application with new views
- **Event Handlers**: Add Kafka consumers for custom event processing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions, issues, or contributions:

1. Check the [User Guide](USER_GUIDE.md) for common setup issues
2. Review existing [GitHub Issues](../../issues)
3. Create a new issue with detailed information about your problem

---

**Built for Maritime Excellence** 🚢 | **Powered by Modern Technology** ⚡