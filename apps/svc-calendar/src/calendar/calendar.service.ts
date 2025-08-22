import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto, ConflictCheckDto } from './dto/calendar-event.dto';
import { CalendarEvent } from '@prisma/client';
import { RRule } from 'rrule';
import ical from 'ical-generator';
import { calculateRiskScore } from '../utils/risk-calculator';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async createEvent(createEventDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    // Validate date range
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate recurrence rule if provided
    if (createEventDto.recurrenceRule) {
      try {
        RRule.fromString(createEventDto.recurrenceRule);
      } catch (error) {
        throw new BadRequestException('Invalid recurrence rule');
      }
    }

    // Check for conflicts
    const conflicts = await this.checkConflicts({
      startDate: createEventDto.startDate,
      endDate: createEventDto.endDate,
      shipIds: createEventDto.shipIds,
      assetIds: createEventDto.assetIds,
    });

    // Calculate risk score
    const riskScore = createEventDto.riskScore || await this.calculateEventRiskScore(createEventDto);

    const event = await this.prisma.calendarEvent.create({
      data: {
        ...createEventDto,
        startDate: startDate,
        endDate: endDate,
        exceptionDates: createEventDto.exceptionDates?.map(d => new Date(d)) || [],
        riskScore,
        metadata: {
          ...createEventDto.metadata,
          conflicts: conflicts.length > 0 ? conflicts.map(c => c.id) : undefined,
        },
      },
    });

    // Emit calendar event (placeholder for Kafka integration)
    // await this.emitCalendarEvent('created', event, conflicts);

    return event;
  }

  async findAll(filters: {
    shipId?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}): Promise<CalendarEvent[]> {
    const where: any = {};

    if (filters.shipId) {
      where.shipIds = { has: filters.shipId };
    }

    if (filters.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.AND = [];
      
      if (filters.startDate) {
        where.AND.push({
          endDate: { gte: new Date(filters.startDate) }
        });
      }
      
      if (filters.endDate) {
        where.AND.push({
          startDate: { lte: new Date(filters.endDate) }
        });
      }
    }

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    const existingEvent = await this.findOne(id);

    // Validate date range if dates are being updated
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = updateEventDto.startDate ? new Date(updateEventDto.startDate) : existingEvent.startDate;
      const endDate = updateEventDto.endDate ? new Date(updateEventDto.endDate) : existingEvent.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Validate recurrence rule if provided
    if (updateEventDto.recurrenceRule) {
      try {
        RRule.fromString(updateEventDto.recurrenceRule);
      } catch (error) {
        throw new BadRequestException('Invalid recurrence rule');
      }
    }

    const updateData: any = { ...updateEventDto };

    if (updateEventDto.startDate) {
      updateData.startDate = new Date(updateEventDto.startDate);
    }

    if (updateEventDto.endDate) {
      updateData.endDate = new Date(updateEventDto.endDate);
    }

    if (updateEventDto.exceptionDates) {
      updateData.exceptionDates = updateEventDto.exceptionDates.map(d => new Date(d));
    }

    const event = await this.prisma.calendarEvent.update({
      where: { id },
      data: updateData,
    });

    // Emit calendar event (placeholder for Kafka integration)
    // await this.emitCalendarEvent('updated', event);

    return event;
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);

    await this.prisma.calendarEvent.delete({
      where: { id },
    });

    // Emit calendar event (placeholder for Kafka integration)
    // await this.emitCalendarEvent('deleted', event);
  }

  async moveEvent(id: string, newStartDate: string, newEndDate: string): Promise<CalendarEvent> {
    const startDate = new Date(newStartDate);
    const endDate = new Date(newEndDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const event = await this.findOne(id);

    // Check for conflicts at new time
    const conflicts = await this.checkConflicts({
      startDate: newStartDate,
      endDate: newEndDate,
      shipIds: event.shipIds,
      assetIds: event.assetIds,
      excludeEventId: id,
    });

    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        startDate,
        endDate,
        metadata: {
          ...event.metadata,
          conflicts: conflicts.length > 0 ? conflicts.map(c => c.id) : undefined,
        },
      },
    });
  }

  async checkConflicts(conflictCheckDto: ConflictCheckDto): Promise<CalendarEvent[]> {
    const where: any = {
      AND: [
        { startDate: { lt: new Date(conflictCheckDto.endDate) } },
        { endDate: { gt: new Date(conflictCheckDto.startDate) } },
        { status: { not: 'cancelled' } },
      ],
      OR: [
        { shipIds: { hasSome: conflictCheckDto.shipIds } },
        { assetIds: { hasSome: conflictCheckDto.assetIds } },
      ],
    };

    if (conflictCheckDto.excludeEventId) {
      where.id = { not: conflictCheckDto.excludeEventId };
    }

    const conflicts = await this.prisma.calendarEvent.findMany({ where });

    // Check against blackout windows
    const blackoutConflicts = await this.checkBlackoutWindowConflicts(
      new Date(conflictCheckDto.startDate),
      new Date(conflictCheckDto.endDate),
      conflictCheckDto.shipIds,
      conflictCheckDto.assetIds
    );

    return [...conflicts, ...blackoutConflicts];
  }

  private async checkBlackoutWindowConflicts(
    startDate: Date,
    endDate: Date,
    shipIds: string[],
    assetIds: string[]
  ): Promise<CalendarEvent[]> {
    const blackoutWindows = await this.prisma.blackoutWindow.findMany({
      where: {
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } },
        ],
        OR: [
          { shipIds: { hasSome: shipIds } },
          { assetIds: { hasSome: assetIds } },
        ],
      },
    });

    // Convert blackout windows to calendar event format for consistency
    return blackoutWindows.map(window => ({
      id: `blackout-${window.id}`,
      title: `Blackout: ${window.name}`,
      description: window.description,
      eventType: 'blackout',
      startDate: window.startDate,
      endDate: window.endDate,
      isAllDay: false,
      recurrenceRule: window.recurrenceRule,
      exceptionDates: [],
      location: null,
      organizer: window.createdBy,
      attendees: [],
      shipIds: window.shipIds,
      assetIds: window.assetIds,
      priority: window.severity === 'blocking' ? 'critical' : 'medium',
      status: 'confirmed',
      riskScore: null,
      metadata: { isBlackoutWindow: true, severity: window.severity },
      createdAt: window.createdAt,
      updatedAt: window.updatedAt,
    })) as CalendarEvent[];
  }

  async generateICalFeed(filters: {
    shipId?: string;
    eventType?: string;
  } = {}): Promise<string> {
    const events = await this.findAll(filters);
    
    const calendar = ical({
      name: 'EdgeNetIQ Fleet Calendar',
      description: 'Fleet maintenance and operational events',
      timezone: 'UTC',
    });

    for (const event of events) {
      const calEvent = calendar.createEvent({
        id: event.id,
        start: event.startDate,
        end: event.endDate,
        allDay: event.isAllDay,
        summary: event.title,
        description: event.description || '',
        location: event.location || '',
        organizer: { name: event.organizer, email: `${event.organizer}@edgenetiq.com` },
        attendees: event.attendees.map(a => ({ name: a, email: `${a}@edgenetiq.com` })),
        categories: [{ name: event.eventType }],
        status: this.mapStatusToICal(event.status),
        priority: this.mapPriorityToICal(event.priority),
      });

      // Add recurrence rule if present
      if (event.recurrenceRule) {
        try {
          const rrule = RRule.fromString(event.recurrenceRule);
          calEvent.repeating(rrule.options);
        } catch (error) {
          console.warn(`Failed to parse RRULE for event ${event.id}:`, error);
        }
      }

      // Add exception dates
      if (event.exceptionDates.length > 0) {
        // Note: ical-generator doesn't directly support EXDATE
        // This is a simplified implementation
        calEvent.description(`${calEvent.description()}\n\nExceptions: ${event.exceptionDates.map(d => d.toISOString()).join(', ')}`);
      }
    }

    return calendar.toString();
  }

  private mapStatusToICal(status: string): any {
    const statusMap: Record<string, any> = {
      scheduled: 'TENTATIVE',
      confirmed: 'CONFIRMED',
      cancelled: 'CANCELLED',
      completed: 'CONFIRMED',
    };
    return statusMap[status] || 'TENTATIVE';
  }

  private mapPriorityToICal(priority: string): number {
    const priorityMap: Record<string, number> = {
      low: 9,
      medium: 5,
      high: 3,
      critical: 1,
    };
    return priorityMap[priority] || 5;
  }

  async expandRecurringEvents(
    eventId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ start: Date; end: Date; originalStart: Date; originalEnd: Date }>> {
    const event = await this.findOne(eventId);
    
    if (!event.recurrenceRule) {
      return [{
        start: event.startDate,
        end: event.endDate,
        originalStart: event.startDate,
        originalEnd: event.endDate,
      }];
    }

    try {
      const rrule = RRule.fromString(event.recurrenceRule);
      const duration = event.endDate.getTime() - event.startDate.getTime();
      
      const occurrences = rrule.between(startDate, endDate);
      
      return occurrences
        .filter(occurrence => {
          // Filter out exception dates
          return !event.exceptionDates.some(exDate => 
            exDate.toISOString() === occurrence.toISOString()
          );
        })
        .map(occurrence => ({
          start: occurrence,
          end: new Date(occurrence.getTime() + duration),
          originalStart: event.startDate,
          originalEnd: event.endDate,
        }));
    } catch (error) {
      console.warn(`Failed to expand recurring event ${eventId}:`, error);
      return [{
        start: event.startDate,
        end: event.endDate,
        originalStart: event.startDate,
        originalEnd: event.endDate,
      }];
    }
  }

  private async calculateEventRiskScore(eventData: CreateCalendarEventDto): Promise<number> {
    // Simplified risk calculation
    return calculateRiskScore({
      daysToEosl: undefined,
      criticality: eventData.priority as any,
      complianceGap: 0,
      sparesBacklog: 0,
      connectivityPenalty: 0,
    });
  }
}