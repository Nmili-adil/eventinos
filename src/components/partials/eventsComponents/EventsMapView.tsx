import React, { useState, useMemo, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
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
  Filter as FilterIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Event, EventStatus } from '@/types/eventsTypes'
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
import { getStatusColor, getStatusText, getTypeText, getVisibilityText } from '@/lib/events-utils'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

const GOOGLE_MAPS_API_KEY = 'AIzaSyAusUjQnEavpTwLKYTj8vbJ4JOkdVus6sg'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 31.792306, // Casablanca default
  lng: -7.080168,
}

const defaultZoom = 5

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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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

  // Calculate map bounds based on filtered events
  const mapBounds = useMemo(() => {
    if (filteredEvents.length === 0 || typeof google === 'undefined' || !google.maps) return null

    const bounds = new google.maps.LatLngBounds()
    filteredEvents.forEach(event => {
      if (event.location?.location?.lat && event.location?.location?.lng) {
        bounds.extend({
          lat: event.location.location.lat,
          lng: event.location.location.lng,
        })
      }
    })
    return bounds
  }, [filteredEvents])

  // Center map on selected city or fit bounds to all events
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
    if (mapBounds) {
      mapInstance.fitBounds(mapBounds)
    }
  }, [mapBounds])

  // Update map bounds when filtered events change
  React.useEffect(() => {
    if (map && mapBounds) {
      map.fitBounds(mapBounds)
    }
  }, [map, mapBounds])

  const handleMarkerClick = (event: Event) => {
    setSelectedEvent(event)
    if (map && event.location?.location?.lat && event.location?.location?.lng) {
      map.setCenter({
        lat: event.location.location.lat,
        lng: event.location.location.lng,
      })
      map.setZoom(12)
    }
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    setSelectedEvent(null)
  }

  const handleClearFilters = () => {
    setSelectedCity('all')
    setSearchQuery('')
    setSelectedEvent(null)
  }

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
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
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
              <SelectTrigger className="bg-white text-gray-900">
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
                  isSelected={selectedEvent?._id === event._id}
                  onClick={() => handleMarkerClick(event)}
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
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={defaultZoom}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {filteredEvents.map(event => {
            if (!event.location?.location?.lat || !event.location?.location?.lng) return null
            
            return (
              <Marker
                key={event._id}
                position={{
                  lat: event.location.location.lat,
                  lng: event.location.location.lng,
                }}
                onClick={() => handleMarkerClick(event)}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: typeof google !== 'undefined' && google.maps ? new google.maps.Size(32, 32) : undefined,
                  }}
              >
                {selectedEvent?._id === event._id && (
                  <InfoWindow
                    onCloseClick={() => setSelectedEvent(null)}
                    options={{
                      maxWidth: 300,
                    }}
                  >
                    <div className="p-2">
                      <h3 className="font-semibold text-sm mb-1">{event.name || event.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">{event.location?.city}</p>
                      <Badge className={cn('text-xs', getStatusColor(event.status))}>
                        {getStatusText(event.status)}
                      </Badge>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            )
          })}
        </GoogleMap>
      </div>
    </LoadScript>
  )
}

// Event Card Component
interface EventCardProps {
  event: Event
  isSelected: boolean
  onClick: () => void
  onPreview: () => void
  onEdit: () => void
  onChangeStatus: () => void
  onDelete: () => void
}

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
        'cursor-pointer transition-all hover:shadow-lg border-2',
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
              {getStatusText(event.status)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getVisibilityText(event.visibility)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getTypeText(event.type)}
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

