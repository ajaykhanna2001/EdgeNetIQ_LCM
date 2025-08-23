import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { Calendar as CalendarIcon, Filter, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { calendarApi, mockShips, mockEventTypes, EventFilters } from '@/services/api'
import { cn } from '@/lib/utils'

export function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [filters, setFilters] = React.useState<EventFilters>({})
  const [showFilters, setShowFilters] = React.useState(false)

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => calendarApi.getEvents(filters),
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.startDate.toString())
      return isSameDay(eventDate, day)
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleIcsDownload = async () => {
    const url = await calendarApi.getIcsUrl(filters)
    window.open(url, '_blank')
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading calendar events</p>
        <p className="text-sm text-gray-500 mt-2">
          Make sure the calendar service is running on port 3001
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-primary-600" />
            Fleet Calendar
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={handleIcsDownload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download ICS
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ship</label>
              <select
                value={filters.shipId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, shipId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Ships</option>
                {mockShips.map(ship => (
                  <option key={ship.id} value={ship.id}>{ship.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={filters.eventType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Types</option>
                {mockEventTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow border">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 py-2 px-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map(day => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "bg-white p-2 h-32 overflow-y-auto",
                  !isCurrentMonth && "bg-gray-50 text-gray-400"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary-600"
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs p-1 rounded truncate cursor-pointer",
                        event.eventType === 'maintenance' && "bg-blue-100 text-blue-800",
                        event.eventType === 'upgrade' && "bg-green-100 text-green-800",
                        event.eventType === 'audit' && "bg-yellow-100 text-yellow-800",
                        event.eventType === 'training' && "bg-purple-100 text-purple-800",
                        event.eventType === 'incident' && "bg-red-100 text-red-800",
                        event.eventType === 'meeting' && "bg-gray-100 text-gray-800"
                      )}
                      title={`${event.title} - ${event.description || 'No description'}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Upcoming Events ({events.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No events found</div>
          ) : (
            events.slice(0, 10).map(event => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Type: {event.eventType}</span>
                      <span>Priority: {event.priority}</span>
                      <span>Status: {event.status}</span>
                      <span>Ships: {event.shipIds.length}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {format(parseISO(event.startDate.toString()), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(event.startDate.toString()), 'h:mm a')} - 
                      {format(parseISO(event.endDate.toString()), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}