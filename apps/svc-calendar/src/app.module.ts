import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CalendarModule } from './calendar/calendar.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    PrismaModule,
    CalendarModule,
  ],
})
export class AppModule {}