import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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