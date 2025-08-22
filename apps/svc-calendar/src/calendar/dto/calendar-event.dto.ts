import { IsString, IsOptional, IsDateString, IsBoolean, IsArray, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['maintenance', 'upgrade', 'audit', 'training', 'incident', 'meeting'] })
  @IsEnum(['maintenance', 'upgrade', 'audit', 'training', 'incident', 'meeting'])
  eventType: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  isAllDay: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  exceptionDates?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsString()
  organizer: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  attendees: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  shipIds: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  assetIds: string[];

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: string;

  @ApiProperty({ enum: ['scheduled', 'confirmed', 'cancelled', 'completed'], default: 'scheduled' })
  @IsEnum(['scheduled', 'confirmed', 'cancelled', 'completed'])
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  riskScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCalendarEventDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ['maintenance', 'upgrade', 'audit', 'training', 'incident', 'meeting'] })
  @IsOptional()
  @IsEnum(['maintenance', 'upgrade', 'audit', 'training', 'incident', 'meeting'])
  eventType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  exceptionDates?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shipIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assetIds?: string[];

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @ApiProperty({ required: false, enum: ['scheduled', 'confirmed', 'cancelled', 'completed'] })
  @IsOptional()
  @IsEnum(['scheduled', 'confirmed', 'cancelled', 'completed'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  riskScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class MoveEventDto {
  @ApiProperty()
  @IsDateString()
  newStartDate: string;

  @ApiProperty()
  @IsDateString()
  newEndDate: string;
}

export class ConflictCheckDto {
  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  shipIds: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  assetIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  excludeEventId?: string;
}