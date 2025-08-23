#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/edgenetiq'
    }
  }
})

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.calendarEvent.deleteMany()
  await prisma.blackoutWindow.deleteMany()
  await prisma.lifecycleEvent.deleteMany()
  await prisma.complianceControl.deleteMany()
  await prisma.license.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.ship.deleteMany()

  // Create ships
  console.log('🚢 Creating ships...')
  const atlanticStar = await prisma.ship.create({
    data: {
      id: 'ship-atlantic-star',
      name: 'MV Atlantic Star',
      type: 'container',
      imo: '9876543',
      callSign: 'VZAA',
      flag: 'Panama',
      owner: 'Atlantic Shipping Lines',
      operationalStatus: 'active',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        port: 'New York'
      },
      contactInfo: {
        email: 'captain@atlanticstar.com',
        satellite: '+1-234-567-8900',
        radio: 'VHF Channel 16'
      }
    }
  })

  const pacificExplorer = await prisma.ship.create({
    data: {
      id: 'ship-pacific-explorer',
      name: 'MV Pacific Explorer',
      type: 'cargo',
      imo: '9876544',
      callSign: 'VZAB',
      flag: 'Liberia',
      owner: 'Pacific Maritime Corp',
      operationalStatus: 'active',
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        port: 'Los Angeles'
      },
      contactInfo: {
        email: 'ops@pacificexplorer.com',
        satellite: '+1-234-567-8901'
      }
    }
  })

  // Create assets
  console.log('⚙️ Creating assets...')
  const mainEngine = await prisma.asset.create({
    data: {
      id: 'asset-main-engine-001',
      name: 'Main Diesel Engine',
      type: 'server',
      shipId: atlanticStar.id,
      status: 'active',
      criticality: 'critical',
      manufacturer: 'MAN Energy Solutions',
      model: 'ME-C9.5',
      serialNumber: 'ME-123456',
      location: 'Engine Room Level 1',
      tags: ['propulsion', 'primary', 'diesel'],
      metadata: {
        power_output: '45000kW',
        fuel_type: 'HFO',
        installation_date: '2020-03-15'
      }
    }
  })

  const navigationRadar = await prisma.asset.create({
    data: {
      id: 'asset-nav-radar-001',
      name: 'Navigation Radar System',
      type: 'network',
      shipId: atlanticStar.id,
      status: 'active',
      criticality: 'high',
      manufacturer: 'Furuno',
      model: 'FAR-3220',
      serialNumber: 'FUR-789012',
      ipAddress: '192.168.1.10',
      location: 'Bridge',
      tags: ['navigation', 'radar', 'safety'],
      metadata: {
        frequency: 'X-band',
        range: '96nm',
        installation_date: '2021-01-10'
      }
    }
  })

  const fireSuppressionSystem = await prisma.asset.create({
    data: {
      id: 'asset-fire-suppression-001',
      name: 'CO2 Fire Suppression System',
      type: 'safety',
      shipId: pacificExplorer.id,
      status: 'active',
      criticality: 'critical',
      manufacturer: 'Marioff Corporation',
      model: 'HI-FOG',
      serialNumber: 'MAR-345678',
      location: 'Engine Room',
      tags: ['safety', 'fire', 'suppression'],
      metadata: {
        capacity: '2000kg CO2',
        coverage: 'Engine Room, Pump Room',
        last_inspection: '2024-01-15'
      }
    }
  })

  // Create contracts
  console.log('📄 Creating contracts...')
  const engineMaintenanceContract = await prisma.contract.create({
    data: {
      id: 'contract-engine-maint-001',
      name: 'Main Engine Maintenance Contract',
      vendor: 'MAN Energy Solutions',
      type: 'service',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      value: 150000,
      currency: 'USD',
      renewalTerms: 'Auto-renewable for 1 year terms',
      contactPerson: 'John Smith',
      contactEmail: 'j.smith@man-es.com',
      terms: 'Comprehensive maintenance and repair services for MAN ME-C engines'
    }
  })

  const navigationSoftwareLicense = await prisma.contract.create({
    data: {
      id: 'contract-nav-software-001',
      name: 'Navigation Software License',
      vendor: 'ChartWorld International',
      type: 'software',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      value: 25000,
      currency: 'USD',
      contactPerson: 'Sarah Johnson',
      contactEmail: 's.johnson@chartworld.com',
      terms: 'Electronic chart licenses and navigation software'
    }
  })

  // Create licenses
  console.log('📃 Creating licenses...')
  await prisma.license.create({
    data: {
      id: 'license-nav-charts-001',
      contractId: navigationSoftwareLicense.id,
      name: 'Electronic Navigation Charts',
      type: 'site_license',
      totalLicenses: 10,
      usedLicenses: 8,
      availableLicenses: 2,
      cost: 15000,
      costModel: 'annual',
      expiryDate: new Date('2025-12-31'),
      autoRenewal: true,
      assetIds: [navigationRadar.id],
      metadata: {
        coverage_areas: ['North Atlantic', 'Mediterranean', 'North Sea'],
        chart_types: ['ENC', 'RNC']
      }
    }
  })

  // Create lifecycle events
  console.log('🔄 Creating lifecycle events...')
  await prisma.lifecycleEvent.create({
    data: {
      id: 'lifecycle-engine-eosl-001',
      assetId: mainEngine.id,
      eventType: 'eosl',
      scheduledDate: new Date('2024-06-15'), // 90 days from now (simulated)
      status: 'scheduled',
      description: 'Main engine approaching End of Service Life',
      riskLevel: 'high',
      impactAssessment: 'Critical system approaching EOSL. Replacement planning required.',
      remediationPlan: 'Evaluate replacement options and schedule installation during next dry dock'
    }
  })

  await prisma.lifecycleEvent.create({
    data: {
      id: 'lifecycle-radar-upgrade-001',
      assetId: navigationRadar.id,
      eventType: 'upgrade',
      scheduledDate: new Date('2024-04-01'),
      status: 'scheduled',
      description: 'Navigation radar software upgrade to v3.2',
      riskLevel: 'medium',
      impactAssessment: 'Temporary navigation downtime during upgrade',
      remediationPlan: 'Schedule during port stay, have backup navigation ready'
    }
  })

  // Create compliance controls
  console.log('🛡️ Creating compliance controls...')
  await prisma.complianceControl.create({
    data: {
      id: 'compliance-fire-safety-001',
      name: 'Fire Safety System Inspection',
      framework: 'solas',
      category: 'Fire Safety',
      description: 'Regular inspection and testing of fire detection and suppression systems',
      severity: 'critical',
      status: 'compliant',
      evidenceRequired: ['Inspection Report', 'Test Results', 'Maintenance Log'],
      lastAssessment: new Date('2024-01-15'),
      nextAssessment: new Date('2024-04-15'),
      assignedTo: 'safety@atlanticstar.com',
      assetIds: [fireSuppressionSystem.id],
      metadata: {
        regulation: 'SOLAS Chapter II-2',
        inspection_interval: '3 months'
      }
    }
  })

  await prisma.complianceControl.create({
    data: {
      id: 'compliance-navigation-001',
      name: 'Navigation Equipment Compliance',
      framework: 'solas',
      category: 'Navigation',
      description: 'Ensure navigation equipment meets SOLAS requirements',
      severity: 'high',
      status: 'compliant',
      evidenceRequired: ['Type Approval Certificate', 'Calibration Certificate'],
      lastAssessment: new Date('2024-01-10'),
      nextAssessment: new Date('2024-07-10'),
      assignedTo: 'navigation@atlanticstar.com',
      assetIds: [navigationRadar.id],
      metadata: {
        regulation: 'SOLAS Chapter V',
        inspection_interval: '6 months'
      }
    }
  })

  // Create blackout windows
  console.log('⚫ Creating blackout windows...')
  await prisma.blackoutWindow.create({
    data: {
      id: 'blackout-port-stay-001',
      name: 'Port Operations Blackout',
      description: 'No maintenance activities during port cargo operations',
      startDate: new Date('2024-03-15T06:00:00Z'),
      endDate: new Date('2024-03-17T18:00:00Z'),
      shipIds: [atlanticStar.id],
      assetIds: [mainEngine.id, navigationRadar.id],
      eventTypes: ['maintenance', 'upgrade'],
      severity: 'blocking',
      reason: 'Port cargo operations require full system availability',
      createdBy: 'port-ops@atlanticstar.com'
    }
  })

  // Create calendar events
  console.log('📅 Creating calendar events...')
  await prisma.calendarEvent.create({
    data: {
      id: 'event-engine-inspection-001',
      title: 'Main Engine Monthly Inspection',
      description: 'Routine monthly inspection of main diesel engine',
      eventType: 'maintenance',
      startDate: new Date('2024-03-20T10:00:00Z'),
      endDate: new Date('2024-03-20T14:00:00Z'),
      isAllDay: false,
      recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=20',
      location: 'Engine Room',
      organizer: 'chief.engineer@atlanticstar.com',
      attendees: ['engine.crew@atlanticstar.com', 'safety.officer@atlanticstar.com'],
      shipIds: [atlanticStar.id],
      assetIds: [mainEngine.id],
      priority: 'high',
      status: 'confirmed',
      riskScore: 0.7,
      metadata: {
        maintenance_type: 'routine',
        estimated_duration: '4 hours',
        required_tools: ['inspection kit', 'measuring tools']
      }
    }
  })

  await prisma.calendarEvent.create({
    data: {
      id: 'event-radar-calibration-001',
      title: 'Navigation Radar Calibration',
      description: 'Quarterly calibration of navigation radar system',
      eventType: 'maintenance',
      startDate: new Date('2024-03-25T08:00:00Z'),
      endDate: new Date('2024-03-25T12:00:00Z'),
      isAllDay: false,
      recurrenceRule: 'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=25',
      location: 'Bridge',
      organizer: 'navigation.officer@atlanticstar.com',
      attendees: ['electronics.tech@atlanticstar.com'],
      shipIds: [atlanticStar.id],
      assetIds: [navigationRadar.id],
      priority: 'medium',
      status: 'scheduled',
      riskScore: 0.4,
      metadata: {
        calibration_type: 'performance',
        service_provider: 'Furuno Certified Technician'
      }
    }
  })

  await prisma.calendarEvent.create({
    data: {
      id: 'event-safety-drill-001',
      title: 'Fire Safety Drill',
      description: 'Monthly fire safety drill and equipment check',
      eventType: 'training',
      startDate: new Date('2024-03-28T15:00:00Z'),
      endDate: new Date('2024-03-28T17:00:00Z'),
      isAllDay: false,
      recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=28',
      location: 'Multiple Locations',
      organizer: 'safety.officer@atlanticstar.com',
      attendees: ['all.crew@atlanticstar.com'],
      shipIds: [atlanticStar.id],
      assetIds: [fireSuppressionSystem.id],
      priority: 'critical',
      status: 'confirmed',
      riskScore: 0.9,
      metadata: {
        drill_type: 'fire_safety',
        mandatory_attendance: true,
        duration: '2 hours'
      }
    }
  })

  // Create webhook subscriptions
  console.log('🔗 Creating webhook subscriptions...')
  await prisma.webhookSubscription.create({
    data: {
      id: 'webhook-fleet-ops-001',
      name: 'Fleet Operations Notifications',
      url: 'https://fleet-ops.example.com/webhooks/edgenetiq',
      events: ['calendar.event.created', 'calendar.event.updated', 'lifecycle.eosl_90d'],
      secret: 'webhook-secret-123',
      isActive: true,
      headers: {
        'X-Fleet-ID': 'atlantic-fleet',
        'Content-Type': 'application/json'
      },
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffSeconds: 300
      }
    }
  })

  console.log('✅ Database seeding completed successfully!')
  
  // Print summary
  const counts = {
    ships: await prisma.ship.count(),
    assets: await prisma.asset.count(),
    contracts: await prisma.contract.count(),
    licenses: await prisma.license.count(),
    lifecycleEvents: await prisma.lifecycleEvent.count(),
    complianceControls: await prisma.complianceControl.count(),
    calendarEvents: await prisma.calendarEvent.count(),
    blackoutWindows: await prisma.blackoutWindow.count(),
    webhookSubscriptions: await prisma.webhookSubscription.count()
  }

  console.log('\n📊 Seeding Summary:')
  console.log('==================')
  Object.entries(counts).forEach(([key, count]) => {
    console.log(`${key.padEnd(20)}: ${count}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })