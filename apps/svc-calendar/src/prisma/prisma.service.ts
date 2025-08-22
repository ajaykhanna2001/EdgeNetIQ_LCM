import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

// Try to import PrismaClient, but provide fallback for CI environments
let PrismaClient: any;
try {
  ({ PrismaClient } = require('@prisma/client'));
} catch (error) {
  // Fallback for environments where Prisma client generation failed
  console.warn('Prisma client not available, using mock client for CI/offline environments');
  PrismaClient = class MockPrismaClient {
    $connect() { return Promise.resolve(); }
    $disconnect() { return Promise.resolve(); }
    calendarEvent = {
      create: () => Promise.reject(new Error('Database not available')),
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      update: () => Promise.reject(new Error('Database not available')),
      delete: () => Promise.reject(new Error('Database not available')),
    };
    blackoutWindow = {
      findMany: () => Promise.resolve([]),
    };
  };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error.message);
      // In offline/CI environments, this might fail but we want to continue
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('Database connection failed - this may be expected in CI/offline environments');
      } else {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error.message);
    }
  }
}