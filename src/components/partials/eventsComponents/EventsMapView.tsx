import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  X,
  Search,
  Filter as FilterIcon,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Event, EventCardProps } from '@/types/eventsTypes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getStatusColor } from '@/lib/events-utils'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { GoogleMapWrapper, MultiMarkerMap, type MapMarker } from '@/components/shared/GoogleMap'

interface EventsMapViewProps {
  events: Event[]
  onEventClick?: (event: Event) => void
  onEdit?: (eventId: string) => void
  onChangeStatus?: (eventId: string) => void
  onDelete?: (eventId: string, eventTitle: string) => void
}

export const EventsMapView: React.FC<EventsMapViewProps> = ({
  events,
  onEventClick,
  onEdit,
  onChangeStatus,
  onDelete,
}) => {
  const { t } = useTranslation()
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const DEFAULT_MAP_ZOOM = 7
  const pinIcon = useMemo(() => {
    const svg = `<svg width="40" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" fill="%232563EB"/></svg>`
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }, [])

  // Get unique cities from events
  const cities = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(events.map(event => event.location?.city).filter(Boolean))
    ) as string[]
    return uniqueCities.sort()
  }, [events])

  // Filter events by city and search
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCity = selectedCity === 'all' || event.location?.city === selectedCity
      const matchesSearch = !searchQuery || 
        event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCity && matchesSearch && event.location?.location?.lat && event.location?.location?.lng
    })
  }, [events, selectedCity, searchQuery])

  // Convert events to map markers
  const markers: MapMarker[] = useMemo(() => {
    return filteredEvents.map(event => ({
      id: event._id,
      position: {
        lat: event.location!.location!.lat,
        lng: event.location!.location!.lng,
      },
      title: event.name || event.title,
      icon: pinIcon,
      info: (
        <div className="p-2 max-w-[280px]">
          {event.image && (
            <img 
              src={event.image} 
              alt={event.name || event.title}
              className="w-full h-32 object-cover rounded mb-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )}
          <h3 className="font-semibold text-sm mb-2">{event.name || event.title}</h3>
          <div className="flex items-center gap-1 flex-wrap mb-2">
            <Badge variant="secondary" className="text-xs">{event.location?.city}</Badge>
            <Badge className={cn('text-xs', getStatusColor(event.status))}>
              {event.status}
            </Badge>
            <Badge variant="outline" className="text-xs">{event.visibility}</Badge>
            <Badge variant="outline" className="text-xs">{event.type}</Badge>
          </div>
        </div>
      ),
    }))
  }, [filteredEvents, pinIcon])

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedEventId(marker.id)
  }

  const handleEventCardClick = (event: Event) => {
    setSelectedEventId(event._id)
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    setSelectedEventId(null)
  }

  const handleClearFilters = () => {
    setSelectedCity('all')
    setSearchQuery('')
    setSelectedEventId(null)
  }

  const handleZoom = useCallback((delta: number) => {
    if (!mapInstance) return
    const currentZoom = mapInstance.getZoom() ?? DEFAULT_MAP_ZOOM
    mapInstance.setZoom(Math.max(2, Math.min(20, currentZoom + delta)))
  }, [mapInstance, DEFAULT_MAP_ZOOM])

  return (
    <GoogleMapWrapper>
      <div className="relative w-full h-[calc(100vh-250px)] min-h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-lg">
        {/* Sidebar */}
        <div
          className={cn(
            'absolute top-0 left-0 z-10 h-full bg-white shadow-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col',
            isSidebarOpen 
              ? 'w-full md:w-96 lg:w-[420px]' 
              : 'w-0'
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b bg-linear-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('events.mapView')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="text-white hover:bg-white/20 md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('events.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white text-gray-900"
              />
            </div>

            {/* City Filter */}
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="bg-white text-gray-900 w-full">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('events.selectCity')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('events.allCities')}</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(selectedCity !== 'all' || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-2 w-full bg-white text-gray-900 hover:bg-gray-100"
              >
                {t('events.clearFilters')}
              </Button>
            )}

            {/* Event Count */}
            <div className="mt-3 text-sm text-white/90">
              {filteredEvents.length} {t('events.eventsFound')}
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">{t('events.noEventsFound')}</p>
              </div>
            ) : (
              filteredEvents.map(event => (
                <EventCard
                  key={event._id}
                  event={event}
                  isSelected={selectedEventId === event._id}
                  onClick={() => handleEventCardClick(event)}
                  onPreview={() => onEventClick?.(event)}
                  onEdit={() => onEdit?.(event._id)}
                  onChangeStatus={() => onChangeStatus?.(event._id)}
                  onDelete={() => onDelete?.(event._id, event.name || event.title)}
                />
              ))
            )}
          </div>
        </div>

        {/* Toggle Sidebar Button (when closed) */}
        {!isSidebarOpen && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 shadow-lg"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            {t('events.showEvents')}
          </Button>
        )}

        {/* Map */}
        <div className="h-full">
          <MultiMarkerMap
            markers={markers}
            selectedMarkerId={selectedEventId}
            onMarkerClick={handleMarkerClick}
            height="100%"
            fitBounds={true}
            onMapReady={setMapInstance}
          />
          {mapInstance && (
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => handleZoom(1)}
                className="h-10 w-10 shadow-lg"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => handleZoom(-1)}
                className="h-10 w-10 shadow-lg"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </GoogleMapWrapper>
  )
}

// Event Card Component


const EventCard: React.FC<EventCardProps> = ({
  event,
  isSelected,
  onClick,
  onPreview,
  onEdit,
  onChangeStatus,
  onDelete,
}) => {
  const { t } = useTranslation()

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg border-2 py-0',
        isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300'
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Event Image */}
        {event.image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={event.image}
              alt={event.name || event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://via.placeholder.com/400x200?text=No+Image'
              }}
            />
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview() }}>
                    <Eye className="h-4 w-4 mr-2" />
                    {t('events.preview')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeStatus() }}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('events.changeStatus')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete() }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">
            {event.name || event.title}
          </h3>

          {/* Status Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn('text-xs', getStatusColor(event.status))}>
              {event.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {event.visibility}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Location and Date */}
          <div className="space-y-1 text-xs text-gray-500">
            {event.location?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{event.location.city}, {event.location.country}</span>
              </div>
            )}
            {event.startDate?.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(event.startDate.date)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

