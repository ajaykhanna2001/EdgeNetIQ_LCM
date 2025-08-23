import Joi from 'joi';
import { ServiceConfig, DatabaseConfig, KafkaConfig, RedisConfig } from '@edgenetiq/shared-types';

const databaseSchema = Joi.object<DatabaseConfig>({
  host: Joi.string().required(),
  port: Joi.number().port().required(),
  database: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  ssl: Joi.boolean().default(false),
  poolMax: Joi.number().min(1).default(10),
  poolMin: Joi.number().min(0).default(2),
});

const kafkaSchema = Joi.object<KafkaConfig>({
  brokers: Joi.array().items(Joi.string()).min(1).required(),
  clientId: Joi.string().required(),
  groupId: Joi.string().optional(),
  ssl: Joi.boolean().default(false),
  sasl: Joi.object({
    mechanism: Joi.string().valid('plain', 'scram-sha-256', 'scram-sha-512').required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).optional(),
});

const redisSchema = Joi.object<RedisConfig>({
  host: Joi.string().required(),
  port: Joi.number().port().required(),
  password: Joi.string().optional(),
  database: Joi.number().min(0).max(15).default(0),
  keyPrefix: Joi.string().optional(),
});

const serviceConfigSchema = Joi.object<ServiceConfig>({
  name: Joi.string().required(),
  port: Joi.number().port().required(),
  host: Joi.string().default('0.0.0.0'),
  environment: Joi.string().valid('development', 'staging', 'production').required(),
  database: databaseSchema.required(),
  kafka: kafkaSchema.optional(),
  redis: redisSchema.optional(),
  cors: Joi.object({
    origin: Joi.array().items(Joi.string()).default(['*']),
    credentials: Joi.boolean().default(true),
  }).optional(),
  rateLimit: Joi.object({
    windowMs: Joi.number().min(1000).default(60000), // 1 minute
    max: Joi.number().min(1).default(100),
  }).optional(),
  observability: Joi.object({
    enableTracing: Joi.boolean().default(true),
    enableMetrics: Joi.boolean().default(true),
    jaegerEndpoint: Joi.string().optional(),
  }).optional(),
});

export function validateConfig<T = ServiceConfig>(config: any, schema: Joi.ObjectSchema<T> = serviceConfigSchema as any): T {
  const { error, value } = schema.validate(config, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    throw new Error(`Configuration validation failed: ${error.details.map(d => d.message).join(', ')}`);
  }

  return value;
}

export function loadServiceConfig(serviceName: string): ServiceConfig {
  const config = {
    name: serviceName,
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      database: process.env.DATABASE_NAME || 'edgenetiq',
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      ssl: process.env.DATABASE_SSL === 'true',
      poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
      poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    },
    kafka: process.env.KAFKA_BROKERS ? {
      brokers: process.env.KAFKA_BROKERS.split(','),
      clientId: process.env.KAFKA_CLIENT_ID || serviceName,
      groupId: process.env.KAFKA_GROUP_ID,
      ssl: process.env.KAFKA_SSL === 'true',
      sasl: process.env.KAFKA_SASL_USERNAME ? {
        mechanism: process.env.KAFKA_SASL_MECHANISM || 'plain',
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD || '',
      } : undefined,
    } : undefined,
    redis: process.env.REDIS_HOST ? {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DATABASE || '0', 10),
      keyPrefix: process.env.REDIS_KEY_PREFIX,
    } : undefined,
    cors: {
      origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
      credentials: process.env.CORS_CREDENTIALS !== 'false',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
    observability: {
      enableTracing: process.env.ENABLE_TRACING !== 'false',
      enableMetrics: process.env.ENABLE_METRICS !== 'false',
      jaegerEndpoint: process.env.JAEGER_ENDPOINT,
    },
  };

  return validateConfig(config);
}

export function loadEdgeAgentConfig() {
  return {
    agentId: process.env.AGENT_ID || 'agent-1',
    shipId: process.env.SHIP_ID || 'ship-1',
    serverUrl: process.env.SERVER_URL || 'http://localhost:3001',
    apiKey: process.env.API_KEY || 'dev-key',
    flushIntervalSeconds: parseInt(process.env.FLUSH_INTERVAL_SECONDS || '300', 10), // 5 minutes
    maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE || '100', 10),
    enableMTLS: process.env.ENABLE_MTLS === 'true',
    certificates: process.env.ENABLE_MTLS === 'true' ? {
      cert: process.env.CLIENT_CERT_PATH || '',
      key: process.env.CLIENT_KEY_PATH || '',
      ca: process.env.CA_CERT_PATH || '',
    } : undefined,
    connectors: JSON.parse(process.env.CONNECTORS || '[]'),
  };
}

export function getRiskWeights() {
  return {
    eoslWeight: parseFloat(process.env.RISK_EOSL_WEIGHT || '0.4'),
    criticalityWeight: parseFloat(process.env.RISK_CRITICALITY_WEIGHT || '0.3'),
    complianceWeight: parseFloat(process.env.RISK_COMPLIANCE_WEIGHT || '0.15'),
    sparesWeight: parseFloat(process.env.RISK_SPARES_WEIGHT || '0.1'),
    connectivityWeight: parseFloat(process.env.RISK_CONNECTIVITY_WEIGHT || '0.05'),
  };
}

export { serviceConfigSchema, databaseSchema, kafkaSchema, redisSchema };