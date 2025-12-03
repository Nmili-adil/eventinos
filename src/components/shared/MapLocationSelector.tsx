import { useState, useCallback, useMemo } from 'react'
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Crosshair,
  Zap,
  X,
  Search,
  Copy,
  Check,
  Compass,
} from 'lucide-react'
import { useGoogleMaps } from './GoogleMap'

interface LocationCoordinates {
  lat: number
  lng: number
}

export interface LocationValue {
  name?: string
  address?: string
  city?: string
  country?: string
  countryCode?: string
  place_id?: string
  location?: LocationCoordinates | null
}

interface MapLocationSelectorProps {
  value?: LocationValue
  onChange: (value: LocationValue) => void
  height?: string
  center?: LocationCoordinates
  zoom?: number
  enableSearch?: boolean
  enableGeolocation?: boolean
}

// Default center (Morocco - Casablanca)
const DEFAULT_CENTER: LocationCoordinates = { lat: 33.5731, lng: -7.5898 }
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }

export const MapLocationSelector = ({
  value,
  onChange,
  height = '400px',
  center,
  zoom = 13,
  enableSearch = true,
  enableGeolocation = true,
}: MapLocationSelectorProps) => {
  const { mapId } = useGoogleMaps()
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedLocation = useMemo(() => {
    return value?.location || null
  }, [value])

  const mapCenter = useMemo(() => {
    if (center) return center
    if (selectedLocation) return selectedLocation
    return DEFAULT_CENTER
  }, [center, selectedLocation])

  const mapOptions = useMemo(
    () => ({
      mapId,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
      disableDoubleClickZoom: false,
      clickableIcons: false,
    }),
    [mapId],
  )

  const mapStyle = useMemo(() => ({ height }), [height])

  // Handle map click
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const place = results[0]
          const components = place.address_components ?? []
          const findComponent = (type: string) =>
            components.find(component => component.types.includes(type))

          onChange({
            ...value,
            location: { lat, lng },
            address: place.formatted_address || value?.address,
            city: findComponent('locality')?.long_name || value?.city,
            country: findComponent('country')?.long_name || value?.country,
            countryCode: findComponent('country')?.short_name || value?.countryCode,
            place_id: place.place_id || value?.place_id,
          })
        } else {
          onChange({
            ...value,
            location: { lat, lng },
          })
        }
      })
    },
    [onChange, value],
  )

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return
      handleMapClick(event)
    },
    [handleMapClick],
  )

  // Handle search
  const handlePlacesChanged = useCallback(() => {
    const places = searchBox?.getPlaces()
    if (!places || !places.length) return

    const place = places[0]
    const geometry = place.geometry
    if (!geometry?.location) return

    const lat = geometry.location.lat()
    const lng = geometry.location.lng()
    const newCenter = { lat, lng }

    map?.panTo(newCenter)
    map?.setZoom(15)

    const components = place.address_components ?? []
    const findComponent = (type: string) =>
      components.find(component => component.types.includes(type))

    onChange({
      ...value,
      location: newCenter,
      name: place.name || value?.name,
      address: place.formatted_address || value?.address,
      city: findComponent('locality')?.long_name || value?.city,
      country: findComponent('country')?.long_name || value?.country,
      countryCode: findComponent('country')?.short_name || value?.countryCode,
      place_id: place.place_id || value?.place_id,
    })

    setSearchInput('')
  }, [searchBox, map, onChange, value])

  // Handle geolocation
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const coords = { lat: latitude, lng: longitude }

        map?.panTo(coords)
        map?.setZoom(15)

        // Reverse geocode
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const place = results[0]
            const components = place.address_components ?? []
            const findComponent = (type: string) =>
              components.find(component => component.types.includes(type))

            onChange({
              ...value,
              location: coords,
              address: place.formatted_address || value?.address,
              city: findComponent('locality')?.long_name || value?.city,
              country: findComponent('country')?.long_name || value?.country,
              countryCode: findComponent('country')?.short_name || value?.countryCode,
              place_id: place.place_id || value?.place_id,
            })
          } else {
            onChange({
              ...value,
              location: coords,
            })
          }
          setIsGeolocating(false)
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your location')
        setIsGeolocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }, [map, onChange, value])

  // Clear selection
  const handleClear = useCallback(() => {
    setSearchInput('')
    onChange({ ...value, location: null })
  }, [onChange, value])

  // Copy coordinates
  const handleCopyCoordinates = useCallback(() => {
    if (!selectedLocation) return
    const text = `${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [selectedLocation])

  // Handle coordinate input
  const handleCoordinateInput = (axis: 'lat' | 'lng', val: string) => {
    const numeric = parseFloat(val)
    if (Number.isNaN(numeric)) return
    const current = selectedLocation ?? { lat: 0, lng: 0 }
    const updated = axis === 'lat' ? { lat: numeric, lng: current.lng } : { lat: current.lat, lng: numeric }
    
    onChange({
      ...value,
      location: updated,
    })
    
    map?.panTo(updated)
  }

  return (
    <div className="space-y-4 w-full">
      {/* Controls */}
      <div className="space-y-3">
        {enableSearch && (
          <div className="relative">
            <Label className="text-sm font-medium mb-2 block">Search Location</Label>
            <StandaloneSearchBox onLoad={setSearchBox} onPlacesChanged={handlePlacesChanged}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="Search for a place, address, or venue..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </StandaloneSearchBox>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {enableGeolocation && (
            <Button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGeolocating}
              variant="outline"
              className="gap-2"
            >
              <Crosshair className="h-4 w-4" />
              {isGeolocating ? 'Locating...' : 'Current Location'}
            </Button>
          )}

          {selectedLocation && (
            <>
              <Button
                type="button"
                onClick={handleCopyCoordinates}
                variant="outline"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleClear}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={mapStyle} className="rounded-lg overflow-hidden border border-slate-200 shadow-md">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          options={mapOptions}
          center={mapCenter}
          zoom={selectedLocation ? zoom : 5}
          onLoad={setMap}
          onClick={handleMapClick}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              draggable
              onDragEnd={handleMarkerDrag}
            />
          )}
        </GoogleMap>
      </div>

      {/* Location Display */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              {value?.name && (
                <div className="font-semibold text-sm text-slate-900">{value.name}</div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Compass className="h-3 w-3" />
                <span>
                  {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                </span>
              </div>
              {value?.address && (
                <div className="text-xs text-slate-600 truncate">
                  📍 {value.address}
                </div>
              )}
              {(value?.city || value?.country) && (
                <div className="text-xs text-slate-600">
                  {value.city && <span>{value.city}</span>}
                  {value.city && value.country && <span>, </span>}
                  {value.country && <span>{value.country}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedLocation && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Zap className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            Click on the map, use search, or enable geolocation to select a location.
          </div>
        </div>
      )}

      {/* Manual Coordinates Input */}
      <div className="space-y-2 border-t border-slate-200 pt-4">
        <Label className="text-sm font-medium">Or Enter Coordinates Manually</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="lat-input" className="text-xs text-muted-foreground mb-1 block">
              Latitude
            </Label>
            <Input
              id="lat-input"
              type="number"
              step="any"
              placeholder="e.g., 33.5731"
              value={selectedLocation?.lat ?? ''}
              onChange={(e) => handleCoordinateInput('lat', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lng-input" className="text-xs text-muted-foreground mb-1 block">
              Longitude
            </Label>
            <Input
              id="lng-input"
              type="number"
              step="any"
              placeholder="e.g., -7.5898"
              value={selectedLocation?.lng ?? ''}
              onChange={(e) => handleCoordinateInput('lng', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
