import { Kafka, Producer, Consumer, KafkaConfig, ProducerConfig, ConsumerConfig, EachMessagePayload } from 'kafkajs';
import { KafkaConfig as EdgeNetIQKafkaConfig } from '@edgenetiq/shared-types';
import { validateEvent, createEvent } from '@edgenetiq/shared-avro';

export interface EventHandler {
  eventType: string;
  handler: (payload: any) => Promise<void>;
}

export class EdgeNetIQKafkaClient {
  private kafka: Kafka;
  private producer?: Producer;
  private consumer?: Consumer;
  private eventHandlers: Map<string, EventHandler['handler']> = new Map();

  constructor(private config: EdgeNetIQKafkaConfig) {
    const kafkaConfig: KafkaConfig = {
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl,
    };

    this.kafka = new Kafka(kafkaConfig);
  }

  async createProducer(config?: ProducerConfig): Promise<Producer> {
    if (this.producer) {
      return this.producer;
    }

    this.producer = this.kafka.producer(config);
    await this.producer.connect();
    return this.producer;
  }

  async createConsumer(config?: ConsumerConfig): Promise<Consumer> {
    if (this.consumer) {
      return this.consumer;
    }

    const consumerConfig: ConsumerConfig = {
      groupId: this.config.groupId || this.config.clientId,
      ...config,
    };

    this.consumer = this.kafka.consumer(consumerConfig);
    await this.consumer.connect();
    return this.consumer;
  }

  async publishEvent(eventType: string, data: any, options: {
    key?: string;
    headers?: Record<string, string>;
    partition?: number;
  } = {}): Promise<void> {
    const producer = await this.createProducer();
    
    // Create and validate event
    const event = createEvent(eventType, data);
    
    const message = {
      key: options.key,
      value: JSON.stringify(event),
      headers: {
        'content-type': 'application/json',
        'event-type': eventType,
        'spec-version': '1.0',
        ...options.headers,
      },
      partition: options.partition,
    };

    await producer.send({
      topic: this.getTopicForEventType(eventType),
      messages: [message],
    });
  }

  registerEventHandler(eventType: string, handler: EventHandler['handler']): void {
    this.eventHandlers.set(eventType, handler);
  }

  async startConsumer(topics: string[]): Promise<void> {
    const consumer = await this.createConsumer();
    
    await consumer.subscribe({ topics });
    
    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const { message, topic, partition } = payload;
      
      if (!message.value) {
        console.warn('Received empty message');
        return;
      }

      const eventData = JSON.parse(message.value.toString());
      const eventType = eventData.eventType || message.headers?.['event-type']?.toString();
      
      if (!eventType) {
        console.warn('Received message without event type');
        return;
      }

      // Validate event
      const validation = validateEvent(eventType, eventData);
      if (!validation.valid) {
        console.error('Invalid event received:', validation.errors);
        return;
      }

      // Handle event
      const handler = this.eventHandlers.get(eventType);
      if (handler) {
        await handler(eventData);
      } else {
        console.warn(`No handler registered for event type: ${eventType}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      throw error; // Let Kafka handle retry logic
    }
  }

  private getTopicForEventType(eventType: string): string {
    // Map event types to topics
    const topicMap: Record<string, string> = {
      'asset.upserted': 'asset-events',
      'lifecycle.eosl_90d': 'lifecycle-events',
      'license.utilization_threshold': 'license-events',
      'compliance.sla_breach': 'compliance-events',
      'calendar.event.created': 'calendar-events',
      'calendar.event.updated': 'calendar-events',
      'calendar.event.deleted': 'calendar-events',
    };

    return topicMap[eventType] || 'default-events';
  }

  async disconnect(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    if (this.producer) {
      promises.push(this.producer.disconnect());
    }
    
    if (this.consumer) {
      promises.push(this.consumer.disconnect());
    }

    await Promise.all(promises);
  }
}

// Helper functions for common events
export async function publishAssetEvent(
  client: EdgeNetIQKafkaClient,
  action: 'created' | 'updated' | 'deleted',
  asset: any,
  changes?: Record<string, any>
): Promise<void> {
  await client.publishEvent('asset.upserted', {
    asset,
    action,
    changes,
  }, {
    key: asset.id,
  });
}

export async function publishLifecycleEvent(
  client: EdgeNetIQKafkaClient,
  assetId: string,
  lifecycle: any,
  daysToEosl?: number,
  action: 'created' | 'updated' | 'warning' = 'updated'
): Promise<void> {
  await client.publishEvent('lifecycle.eosl_90d', {
    assetId,
    lifecycle,
    daysToEosl,
    action,
  }, {
    key: assetId,
  });
}

export async function publishLicenseEvent(
  client: EdgeNetIQKafkaClient,
  license: any,
  utilizationPercentage: number,
  threshold: number,
  action: 'threshold_exceeded' | 'expired' | 'expiring_soon'
): Promise<void> {
  await client.publishEvent('license.utilization_threshold', {
    license,
    utilizationPercentage,
    threshold,
    action,
  }, {
    key: license.id,
  });
}

export async function publishComplianceEvent(
  client: EdgeNetIQKafkaClient,
  control: any,
  action: 'sla_breach' | 'status_change' | 'assessment_due',
  slaBreachHours?: number
): Promise<void> {
  await client.publishEvent('compliance.sla_breach', {
    control,
    action,
    slaBreachHours,
  }, {
    key: control.id,
  });
}

export async function publishCalendarEvent(
  client: EdgeNetIQKafkaClient,
  action: 'created' | 'updated' | 'deleted' | 'conflict_detected',
  event: any,
  conflicts?: any[]
): Promise<void> {
  await client.publishEvent(`calendar.event.${action}`, {
    event,
    action,
    conflicts,
  }, {
    key: event.id,
  });
}

export { EdgeNetIQKafkaClient as KafkaClient };