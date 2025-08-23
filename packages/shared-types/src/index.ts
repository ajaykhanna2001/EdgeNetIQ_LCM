// Core entities
export interface Asset {
  id: string;
  name: string;
  type: 'server' | 'network' | 'storage' | 'security' | 'software';
  shipId: string;
  status: 'active' | 'maintenance' | 'decommissioned';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  location?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ship {
  id: string;
  name: string;
  type: 'container' | 'cargo' | 'tanker' | 'cruise' | 'naval';
  imo?: string;
  callSign?: string;
  flag?: string;
  owner?: string;
  operationalStatus: 'active' | 'maintenance' | 'docked' | 'decommissioned';
  location?: {
    latitude: number;
    longitude: number;
    port?: string;
  };
  contactInfo?: {
    email?: string;
    satellite?: string;
    radio?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  name: string;
  vendor: string;
  type: 'software' | 'hardware' | 'service' | 'support';
  status: 'active' | 'expired' | 'terminated' | 'pending';
  startDate: Date;
  endDate: Date;
  value: number;
  currency: string;
  renewalTerms?: string;
  contactPerson?: string;
  contactEmail?: string;
  terms: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface License {
  id: string;
  contractId: string;
  name: string;
  type: 'per_device' | 'per_user' | 'site_license' | 'enterprise';
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
  cost: number;
  costModel: 'one_time' | 'annual' | 'monthly';
  expiryDate?: Date;
  autoRenewal: boolean;
  assetIds: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LifecycleEvent {
  id: string;
  assetId: string;
  eventType: 'installation' | 'upgrade' | 'maintenance' | 'eosl' | 'eol' | 'retirement';
  scheduledDate: Date;
  actualDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impactAssessment?: string;
  remediationPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceControl {
  id: string;
  name: string;
  framework: 'iso27001' | 'nist' | 'cis' | 'pci_dss' | 'sox' | 'custom';
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'pending';
  evidenceRequired: string[];
  lastAssessment?: Date;
  nextAssessment: Date;
  assignedTo?: string;
  assetIds: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: 'maintenance' | 'upgrade' | 'audit' | 'training' | 'incident' | 'meeting';
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  recurrenceRule?: string; // RRULE format
  exceptionDates?: Date[]; // EXDATE
  location?: string;
  organizer: string;
  attendees: string[];
  shipIds: string[];
  assetIds: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  riskScore?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlackoutWindow {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  recurrenceRule?: string;
  shipIds: string[];
  assetIds: string[];
  eventTypes: string[];
  severity: 'advisory' | 'warning' | 'blocking';
  reason: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookSubscription {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  headers: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Event types for Kafka
export interface BaseEvent {
  id: string;
  eventType: string;
  timestamp: string;
  source: string;
  specVersion: string;
  dataContentType: string;
}

export interface AssetEvent extends BaseEvent {
  data: {
    asset: Asset;
    action: 'created' | 'updated' | 'deleted';
    changes?: Record<string, any>;
  };
}

export interface LifecycleEventKafka extends BaseEvent {
  data: {
    assetId: string;
    lifecycle: LifecycleEvent;
    daysToEosl?: number;
    action: 'created' | 'updated' | 'warning';
  };
}

export interface LicenseEvent extends BaseEvent {
  data: {
    license: License;
    utilizationPercentage: number;
    threshold: number;
    action: 'threshold_exceeded' | 'expired' | 'expiring_soon';
  };
}

export interface ComplianceEvent extends BaseEvent {
  data: {
    control: ComplianceControl;
    slaBreachHours?: number;
    action: 'sla_breach' | 'status_change' | 'assessment_due';
  };
}

export interface CalendarEventData extends BaseEvent {
  data: {
    event: CalendarEvent;
    action: 'created' | 'updated' | 'deleted' | 'conflict_detected';
    conflicts?: CalendarEvent[];
  };
}

// RBAC types
export type Action = 'read' | 'write' | 'delete' | 'manage';
export type Subject = 'asset' | 'ship' | 'contract' | 'license' | 'lifecycle' | 
                     'compliance' | 'calendar' | 'user' | 'system' | 'all';

export interface Role {
  name: string;
  permissions: Array<{
    action: Action;
    subject: Subject;
    conditions?: Record<string, any>;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  shipIds?: string[]; // Ships this user has access to
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Configuration types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolMax?: number;
  poolMin?: number;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId?: string;
  ssl?: boolean;
  sasl?: {
    mechanism: string;
    username: string;
    password: string;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
}

export interface ServiceConfig {
  name: string;
  port: number;
  host: string;
  environment: 'development' | 'staging' | 'production';
  database: DatabaseConfig;
  kafka?: KafkaConfig;
  redis?: RedisConfig;
  cors?: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  observability?: {
    enableTracing: boolean;
    enableMetrics: boolean;
    jaegerEndpoint?: string;
  };
}

// Edge agent types
export interface EdgeAgentConfig {
  agentId: string;
  shipId: string;
  serverUrl: string;
  apiKey: string;
  flushIntervalSeconds: number;
  maxBatchSize: number;
  enableMTLS: boolean;
  certificates?: {
    cert: string;
    key: string;
    ca: string;
  };
  connectors: ConnectorConfig[];
}

export interface ConnectorConfig {
  name: string;
  type: 'snmp' | 'http' | 'ssh' | 'wmi' | 'file';
  enabled: boolean;
  schedule: string; // cron format
  config: Record<string, any>;
}

export interface CollectedData {
  connectorName: string;
  timestamp: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface QueuedMessage {
  id: string;
  payload: CollectedData;
  timestamp: string;
  retryCount: number;
  nextRetry?: string;
}

// Risk calculation types
export interface RiskFactors {
  daysToEosl?: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  complianceGap: number; // 0-1
  sparesBacklog: number; // count
  connectivityPenalty: number; // 0-1
}

export interface RiskWeights {
  eoslWeight: number;
  criticalityWeight: number;
  complianceWeight: number;
  sparesWeight: number;
  connectivityWeight: number;
}

export interface RiskScore {
  overall: number; // 0-1
  factors: RiskFactors;
  weights: RiskWeights;
  components: {
    eosl: number;
    criticality: number;
    compliance: number;
    spares: number;
    connectivity: number;
  };
}