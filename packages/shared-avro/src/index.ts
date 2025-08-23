import Ajv from 'ajv';

// Base event schema
export const baseEventSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    eventType: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    source: { type: 'string' },
    specVersion: { type: 'string' },
    dataContentType: { type: 'string' }
  },
  required: ['id', 'eventType', 'timestamp', 'source', 'specVersion', 'dataContentType'],
  additionalProperties: false
};

// Asset event schemas
export const assetUpsertedSchema = {
  allOf: [
    baseEventSchema,
    {
      type: 'object',
      properties: {
        eventType: { const: 'asset.upserted' },
        data: {
          type: 'object',
          properties: {
            asset: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                type: { enum: ['server', 'network', 'storage', 'security', 'software'] },
                shipId: { type: 'string' },
                status: { enum: ['active', 'maintenance', 'decommissioned'] },
                criticality: { enum: ['low', 'medium', 'high', 'critical'] },
                manufacturer: { type: 'string' },
                model: { type: 'string' },
                serialNumber: { type: 'string' },
                ipAddress: { type: 'string' },
                location: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                metadata: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              },
              required: ['id', 'name', 'type', 'shipId', 'status', 'criticality', 'tags', 'metadata', 'createdAt', 'updatedAt'],
              additionalProperties: false
            },
            action: { enum: ['created', 'updated', 'deleted'] },
            changes: { type: 'object' }
          },
          required: ['asset', 'action'],
          additionalProperties: false
        }
      },
      required: ['data']
    }
  ]
};

// Lifecycle event schemas
export const lifecycleEosl90dSchema = {
  allOf: [
    baseEventSchema,
    {
      type: 'object',
      properties: {
        eventType: { const: 'lifecycle.eosl_90d' },
        data: {
          type: 'object',
          properties: {
            assetId: { type: 'string' },
            lifecycle: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                assetId: { type: 'string' },
                eventType: { enum: ['installation', 'upgrade', 'maintenance', 'eosl', 'eol', 'retirement'] },
                scheduledDate: { type: 'string', format: 'date-time' },
                actualDate: { type: 'string', format: 'date-time' },
                status: { enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] },
                description: { type: 'string' },
                riskLevel: { enum: ['low', 'medium', 'high', 'critical'] },
                impactAssessment: { type: 'string' },
                remediationPlan: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              },
              required: ['id', 'assetId', 'eventType', 'scheduledDate', 'status', 'description', 'riskLevel', 'createdAt', 'updatedAt'],
              additionalProperties: false
            },
            daysToEosl: { type: 'number' },
            action: { enum: ['created', 'updated', 'warning'] }
          },
          required: ['assetId', 'lifecycle', 'action'],
          additionalProperties: false
        }
      },
      required: ['data']
    }
  ]
};

// License event schemas
export const licenseUtilizationThresholdSchema = {
  allOf: [
    baseEventSchema,
    {
      type: 'object',
      properties: {
        eventType: { const: 'license.utilization_threshold' },
        data: {
          type: 'object',
          properties: {
            license: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                contractId: { type: 'string' },
                name: { type: 'string' },
                type: { enum: ['per_device', 'per_user', 'site_license', 'enterprise'] },
                totalLicenses: { type: 'number' },
                usedLicenses: { type: 'number' },
                availableLicenses: { type: 'number' },
                cost: { type: 'number' },
                costModel: { enum: ['one_time', 'annual', 'monthly'] },
                expiryDate: { type: 'string', format: 'date-time' },
                autoRenewal: { type: 'boolean' },
                assetIds: { type: 'array', items: { type: 'string' } },
                metadata: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              },
              required: ['id', 'contractId', 'name', 'type', 'totalLicenses', 'usedLicenses', 'availableLicenses', 'cost', 'costModel', 'autoRenewal', 'assetIds', 'metadata', 'createdAt', 'updatedAt'],
              additionalProperties: false
            },
            utilizationPercentage: { type: 'number' },
            threshold: { type: 'number' },
            action: { enum: ['threshold_exceeded', 'expired', 'expiring_soon'] }
          },
          required: ['license', 'utilizationPercentage', 'threshold', 'action'],
          additionalProperties: false
        }
      },
      required: ['data']
    }
  ]
};

// Compliance event schemas
export const complianceSlaBreachSchema = {
  allOf: [
    baseEventSchema,
    {
      type: 'object',
      properties: {
        eventType: { const: 'compliance.sla_breach' },
        data: {
          type: 'object',
          properties: {
            control: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                framework: { enum: ['iso27001', 'nist', 'cis', 'pci_dss', 'sox', 'custom'] },
                category: { type: 'string' },
                description: { type: 'string' },
                severity: { enum: ['low', 'medium', 'high', 'critical'] },
                status: { enum: ['compliant', 'non_compliant', 'not_applicable', 'pending'] },
                evidenceRequired: { type: 'array', items: { type: 'string' } },
                lastAssessment: { type: 'string', format: 'date-time' },
                nextAssessment: { type: 'string', format: 'date-time' },
                assignedTo: { type: 'string' },
                assetIds: { type: 'array', items: { type: 'string' } },
                metadata: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              },
              required: ['id', 'name', 'framework', 'category', 'description', 'severity', 'status', 'evidenceRequired', 'nextAssessment', 'assetIds', 'metadata', 'createdAt', 'updatedAt'],
              additionalProperties: false
            },
            slaBreachHours: { type: 'number' },
            action: { enum: ['sla_breach', 'status_change', 'assessment_due'] }
          },
          required: ['control', 'action'],
          additionalProperties: false
        }
      },
      required: ['data']
    }
  ]
};

// Calendar event schemas
export const calendarEventV1Schema = {
  allOf: [
    baseEventSchema,
    {
      type: 'object',
      properties: {
        eventType: { enum: ['calendar.event.created', 'calendar.event.updated', 'calendar.event.deleted'] },
        data: {
          type: 'object',
          properties: {
            event: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                eventType: { enum: ['maintenance', 'upgrade', 'audit', 'training', 'incident', 'meeting'] },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                isAllDay: { type: 'boolean' },
                recurrenceRule: { type: 'string' },
                exceptionDates: { type: 'array', items: { type: 'string', format: 'date-time' } },
                location: { type: 'string' },
                organizer: { type: 'string' },
                attendees: { type: 'array', items: { type: 'string' } },
                shipIds: { type: 'array', items: { type: 'string' } },
                assetIds: { type: 'array', items: { type: 'string' } },
                priority: { enum: ['low', 'medium', 'high', 'critical'] },
                status: { enum: ['scheduled', 'confirmed', 'cancelled', 'completed'] },
                riskScore: { type: 'number' },
                metadata: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              },
              required: ['id', 'title', 'eventType', 'startDate', 'endDate', 'isAllDay', 'organizer', 'attendees', 'shipIds', 'assetIds', 'priority', 'status', 'metadata', 'createdAt', 'updatedAt'],
              additionalProperties: false
            },
            action: { enum: ['created', 'updated', 'deleted', 'conflict_detected'] },
            conflicts: {
              type: 'array',
              items: { $ref: '#/allOf/1/properties/data/properties/event' }
            }
          },
          required: ['event', 'action'],
          additionalProperties: false
        }
      },
      required: ['data']
    }
  ]
};

// Schema registry
export const schemas = {
  'asset.upserted': assetUpsertedSchema,
  'lifecycle.eosl_90d': lifecycleEosl90dSchema,
  'license.utilization_threshold': licenseUtilizationThresholdSchema,
  'compliance.sla_breach': complianceSlaBreachSchema,
  'calendar.event.created': calendarEventV1Schema,
  'calendar.event.updated': calendarEventV1Schema,
  'calendar.event.deleted': calendarEventV1Schema,
};

// Validator instance
const ajv = new Ajv({ allErrors: true });

// Compile all schemas
export const validators = Object.entries(schemas).reduce((acc, [eventType, schema]) => {
  acc[eventType] = ajv.compile(schema);
  return acc;
}, {} as Record<string, any>);

export function validateEvent(eventType: string, event: any): { valid: boolean; errors?: any[] } {
  const validator = validators[eventType];
  if (!validator) {
    return { valid: false, errors: [{ message: `Unknown event type: ${eventType}` }] };
  }

  const valid = validator(event);
  return {
    valid,
    errors: valid ? undefined : validator.errors,
  };
}

export function createEvent(eventType: string, data: any, metadata: Partial<{
  id: string;
  source: string;
  specVersion: string;
  dataContentType: string;
}> = {}): any {
  const event = {
    id: metadata.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    timestamp: new Date().toISOString(),
    source: metadata.source || 'edgenetiq-platform',
    specVersion: metadata.specVersion || '1.0',
    dataContentType: metadata.dataContentType || 'application/json',
    data,
  };

  const validation = validateEvent(eventType, event);
  if (!validation.valid) {
    throw new Error(`Invalid event: ${JSON.stringify(validation.errors)}`);
  }

  return event;
}