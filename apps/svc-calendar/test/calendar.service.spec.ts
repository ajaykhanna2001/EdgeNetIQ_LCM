import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from '../src/calendar/calendar.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateCalendarEventDto } from '../src/calendar/dto/calendar-event.dto';
import { RRule } from 'rrule';

describe('CalendarService', () => {
  let service: CalendarService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    calendarEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    blackoutWindow: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create a calendar event successfully', async () => {
      const createEventDto: CreateCalendarEventDto = {
        title: 'Test Maintenance',
        description: 'Test maintenance description',
        eventType: 'maintenance',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        isAllDay: false,
        organizer: 'test@example.com',
        attendees: ['attendee1@example.com'],
        shipIds: ['ship1'],
        assetIds: ['asset1'],
        priority: 'medium',
        status: 'scheduled',
      };

      const mockEvent = {
        id: 'event1',
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        exceptionDates: [],
        riskScore: 0.3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.calendarEvent.findMany.mockResolvedValue([]);
      mockPrismaService.blackoutWindow.findMany.mockResolvedValue([]);
      mockPrismaService.calendarEvent.create.mockResolvedValue(mockEvent);

      const result = await service.createEvent(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(mockPrismaService.calendarEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createEventDto.title,
          eventType: createEventDto.eventType,
          startDate: new Date(createEventDto.startDate),
          endDate: new Date(createEventDto.endDate),
        }),
      });
    });

    it('should throw error for invalid date range', async () => {
      const createEventDto: CreateCalendarEventDto = {
        title: 'Test Event',
        eventType: 'maintenance',
        startDate: '2024-01-15T12:00:00Z',
        endDate: '2024-01-15T10:00:00Z', // End before start
        isAllDay: false,
        organizer: 'test@example.com',
        attendees: [],
        shipIds: ['ship1'],
        assetIds: [],
        priority: 'medium',
        status: 'scheduled',
      };

      await expect(service.createEvent(createEventDto)).rejects.toThrow(
        'End date must be after start date'
      );
    });

    it('should throw error for invalid recurrence rule', async () => {
      const createEventDto: CreateCalendarEventDto = {
        title: 'Test Event',
        eventType: 'maintenance',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        isAllDay: false,
        recurrenceRule: 'INVALID_RRULE',
        organizer: 'test@example.com',
        attendees: [],
        shipIds: ['ship1'],
        assetIds: [],
        priority: 'medium',
        status: 'scheduled',
      };

      await expect(service.createEvent(createEventDto)).rejects.toThrow(
        'Invalid recurrence rule'
      );
    });
  });

  describe('expandRecurringEvents', () => {
    it('should expand recurring events correctly', async () => {
      const mockEvent = {
        id: 'event1',
        title: 'Weekly Maintenance',
        eventType: 'maintenance',
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T12:00:00Z'),
        recurrenceRule: 'FREQ=WEEKLY;COUNT=3',
        exceptionDates: [],
        isAllDay: false,
        organizer: 'test@example.com',
        attendees: [],
        shipIds: ['ship1'],
        assetIds: [],
        priority: 'medium',
        status: 'scheduled',
        riskScore: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        location: null,
      };

      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-02-01T00:00:00Z');

      const result = await service.expandRecurringEvents('event1', startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result[0].start).toEqual(mockEvent.startDate);
      expect(result[1].start).toEqual(new Date('2024-01-22T10:00:00Z'));
      expect(result[2].start).toEqual(new Date('2024-01-29T10:00:00Z'));
    });

    it('should handle non-recurring events', async () => {
      const mockEvent = {
        id: 'event1',
        title: 'One-time Maintenance',
        eventType: 'maintenance',
        startDate: new Date('2024-01-15T10:00:00Z'),
        endDate: new Date('2024-01-15T12:00:00Z'),
        recurrenceRule: null,
        exceptionDates: [],
        isAllDay: false,
        organizer: 'test@example.com',
        attendees: [],
        shipIds: ['ship1'],
        assetIds: [],
        priority: 'medium',
        status: 'scheduled',
        riskScore: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        location: null,
      };

      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-02-01T00:00:00Z');

      const result = await service.expandRecurringEvents('event1', startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].start).toEqual(mockEvent.startDate);
      expect(result[0].end).toEqual(mockEvent.endDate);
    });
  });

  describe('checkConflicts', () => {
    it('should detect event conflicts', async () => {
      const conflictingEvent = {
        id: 'conflict1',
        title: 'Conflicting Event',
        startDate: new Date('2024-01-15T11:00:00Z'),
        endDate: new Date('2024-01-15T13:00:00Z'),
        shipIds: ['ship1'],
        assetIds: [],
        status: 'confirmed',
      };

      mockPrismaService.calendarEvent.findMany.mockResolvedValue([conflictingEvent]);
      mockPrismaService.blackoutWindow.findMany.mockResolvedValue([]);

      const result = await service.checkConflicts({
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        shipIds: ['ship1'],
        assetIds: [],
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('conflict1');
    });

    it('should detect blackout window conflicts', async () => {
      const blackoutWindow = {
        id: 'blackout1',
        name: 'Maintenance Blackout',
        description: 'No maintenance during this period',
        startDate: new Date('2024-01-15T11:00:00Z'),
        endDate: new Date('2024-01-15T13:00:00Z'),
        shipIds: ['ship1'],
        assetIds: [],
        eventTypes: ['maintenance'],
        severity: 'blocking',
        reason: 'Critical operations',
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        recurrenceRule: null,
      };

      mockPrismaService.calendarEvent.findMany.mockResolvedValue([]);
      mockPrismaService.blackoutWindow.findMany.mockResolvedValue([blackoutWindow]);

      const result = await service.checkConflicts({
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        shipIds: ['ship1'],
        assetIds: [],
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('blackout-blackout1');
      expect(result[0].title).toBe('Blackout: Maintenance Blackout');
    });
  });

  describe('generateICalFeed', () => {
    it('should generate valid iCal format', async () => {
      const mockEvents = [
        {
          id: 'event1',
          title: 'Test Event',
          description: 'Test description',
          eventType: 'maintenance',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T12:00:00Z'),
          isAllDay: false,
          location: 'Engine Room',
          organizer: 'tech@example.com',
          attendees: ['crew@example.com'],
          priority: 'high',
          status: 'confirmed',
          recurrenceRule: null,
          exceptionDates: [],
        },
      ];

      mockPrismaService.calendarEvent.findMany.mockResolvedValue(mockEvents);

      const result = await service.generateICalFeed();

      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('BEGIN:VEVENT');
      expect(result).toContain('SUMMARY:Test Event');
      expect(result).toContain('DESCRIPTION:Test description');
      expect(result).toContain('LOCATION:Engine Room');
      expect(result).toContain('END:VEVENT');
      expect(result).toContain('END:VCALENDAR');
    });
  });
});