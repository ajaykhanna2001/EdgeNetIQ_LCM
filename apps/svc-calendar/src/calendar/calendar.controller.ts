import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto, MoveEventDto, ConflictCheckDto } from './dto/calendar-event.dto';
import { IdempotencyMiddleware } from '../middleware/idempotency.middleware';

@ApiTags('calendar')
@Controller('events')
@UseGuards(ThrottlerGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Calendar event created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Event conflicts detected.' })
  @UseGuards(IdempotencyMiddleware)
  async create(@Body() createCalendarEventDto: CreateCalendarEventDto) {
    return this.calendarService.createEvent(createCalendarEventDto);
  }

  @Get()
  @ApiQuery({ name: 'shipId', required: false, description: 'Filter by ship ID' })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter events after this date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter events before this date' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by event status' })
  @ApiResponse({ status: 200, description: 'Calendar events retrieved successfully.' })
  async findAll(
    @Query('shipId') shipId?: string,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.calendarService.findAll({
      shipId,
      eventType,
      startDate,
      endDate,
      status,
    });
  }

  @Get('feed.ics')
  @ApiQuery({ name: 'shipId', required: false, description: 'Filter by ship ID' })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' })
  @ApiResponse({ status: 200, description: 'ICS calendar feed generated successfully.' })
  async getICalFeed(
    @Query('shipId') shipId?: string,
    @Query('eventType') eventType?: string,
    @Res() res?: Response,
  ) {
    const icalData = await this.calendarService.generateICalFeed({
      shipId,
      eventType,
    });

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="edgenetiq-calendar.ics"');
    res.status(HttpStatus.OK).send(icalData);
  }

  @Post('conflicts')
  @ApiResponse({ status: 200, description: 'Conflict check completed.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async checkConflicts(@Body() conflictCheckDto: ConflictCheckDto) {
    return this.calendarService.checkConflicts(conflictCheckDto);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Calendar event ID' })
  @ApiResponse({ status: 200, description: 'Calendar event retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  async findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Calendar event ID' })
  @ApiResponse({ status: 200, description: 'Calendar event updated successfully.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async update(@Param('id') id: string, @Body() updateCalendarEventDto: UpdateCalendarEventDto) {
    return this.calendarService.update(id, updateCalendarEventDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Calendar event ID' })
  @ApiResponse({ status: 200, description: 'Calendar event deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  async remove(@Param('id') id: string) {
    await this.calendarService.remove(id);
    return { message: 'Calendar event deleted successfully' };
  }

  @Post(':id/move')
  @ApiParam({ name: 'id', description: 'Calendar event ID' })
  @ApiResponse({ status: 200, description: 'Calendar event moved successfully.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Event conflicts detected at new time.' })
  async moveEvent(@Param('id') id: string, @Body() moveEventDto: MoveEventDto) {
    return this.calendarService.moveEvent(id, moveEventDto.newStartDate, moveEventDto.newEndDate);
  }

  @Get(':id/expand')
  @ApiParam({ name: 'id', description: 'Calendar event ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date for expansion' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date for expansion' })
  @ApiResponse({ status: 200, description: 'Recurring event instances expanded successfully.' })
  @ApiResponse({ status: 404, description: 'Calendar event not found.' })
  async expandRecurringEvent(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.expandRecurringEvents(
      id,
      new Date(startDate),
      new Date(endDate)
    );
  }
}