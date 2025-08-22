import axios from 'axios'
import { CalendarEvent } from '@edgenetiq/shared-types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface EventFilters {
  shipId?: string
  eventType?: string
  startDate?: string
  endDate?: string
  status?: string
}

export const calendarApi = {
  async getEvents(filters: EventFilters = {}) {
    const response = await api.get<CalendarEvent[]>('/events', { params: filters })
    return response.data
  },

  async getEvent(id: string) {
    const response = await api.get<CalendarEvent>(`/events/${id}`)
    return response.data
  },

  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<CalendarEvent>('/events', event)
    return response.data
  },

  async updateEvent(id: string, event: Partial<CalendarEvent>) {
    const response = await api.patch<CalendarEvent>(`/events/${id}`, event)
    return response.data
  },

  async deleteEvent(id: string) {
    await api.delete(`/events/${id}`)
  },

  async getIcsUrl(filters: EventFilters = {}) {
    const params = new URLSearchParams(filters as Record<string, string>)
    return `${API_BASE_URL}/events/feed.ics?${params.toString()}`
  },

  async checkConflicts(data: {
    startDate: string
    endDate: string
    shipIds: string[]
    assetIds: string[]
    excludeEventId?: string
  }) {
    const response = await api.post<CalendarEvent[]>('/events/conflicts', data)
    return response.data
  },
}

// Mock ship data for the UI
export const mockShips = [
  { id: 'ship-1', name: 'MV Atlantic Star', type: 'container' },
  { id: 'ship-2', name: 'MV Pacific Explorer', type: 'cargo' },
  { id: 'ship-3', name: 'MV Baltic Pioneer', type: 'tanker' },
]

export const mockEventTypes = [
  'maintenance',
  'upgrade',
  'audit',
  'training',
  'incident',
  'meeting',
] as const