import { useState, useCallback, useEffect, useMemo, useId } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import type { LocationCoordinates, LocationValue, BaseMapProps } from './types'
import { useGoogleMaps } from './index'

interface LocationSelectorProps extends BaseMapProps {
  onLocationSelect?: (location: LocationValue) => void
  selectedLocation?: LocationValue
  enableAutocomplete?: boolean
}

const defaultCenter: LocationCoordinates = {
  lat: 31.792306, // Casablanca
  lng: -7.080168,
}

export const LocationSelector = ({
  onLocationSelect,
  selectedLocation,
  enableAutocomplete = true,
  height = '400px',
  zoom = 15,
  center,
  showControls = true,
  className = '',
}: LocationSelectorProps) => {
  const { mapId } = useGoogleMaps()
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const inputId = useId()
  const googleMaps = typeof window !== 'undefined' ? window.google : undefined

  const getMapCenter = () => {
    if (center) return center
    if (selectedLocation?.location) return selectedLocation.location
    return defaultCenter
  }

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Handle map click for location selection
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !onLocationSelect) return
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    if (!googleMaps?.maps) {
      onLocationSelect({ location: { lat, lng } })
      return
    }

    const geocoder = new googleMaps.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const place = results[0]
        const locationValue: LocationValue = {
          location: { lat, lng },
          address: place.formatted_address,
          place_id: place.place_id,
        }

        place.address_components?.forEach(component => {
          if (component.types.includes('locality')) {
            locationValue.city = component.long_name
          }
          if (component.types.includes('country')) {
            locationValue.country = component.long_name
            locationValue.countryCode = component.short_name
          }
        })

        onLocationSelect(locationValue)
      } else {
        onLocationSelect({
          location: { lat, lng },
        })
      }
    })
  }

  // Setup autocomplete
  useEffect(() => {
    if (enableAutocomplete && map && !autocomplete && googleMaps?.maps?.places) {
      const input = document.getElementById(inputId) as HTMLInputElement | null
      if (input) {
        const autocompleteInstance = new googleMaps.maps.places.Autocomplete(input)
        autocompleteInstance.bindTo('bounds', map)

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace()
          if (place.geometry?.location && onLocationSelect) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()

            const locationValue: LocationValue = {
              location: { lat, lng },
              address: place.formatted_address,
              name: place.name,
              place_id: place.place_id,
            }

            // Extract city and country
            place.address_components?.forEach(component => {
              if (component.types.includes('locality')) {
                locationValue.city = component.long_name
              }
              if (component.types.includes('country')) {
                locationValue.country = component.long_name
                locationValue.countryCode = component.short_name
              }
            })

            onLocationSelect(locationValue)
            map.setCenter({ lat, lng })
            map.setZoom(15)
          }
        })

        setAutocomplete(autocompleteInstance)
      }
    }
  }, [enableAutocomplete, map, autocomplete, onLocationSelect, googleMaps, inputId])

  const mapOptions = useMemo(
    () => ({
      mapId,
      streetViewControl: showControls,
      mapTypeControl: showControls,
      fullscreenControl: showControls,
      zoomControl: showControls,
    }),
    [mapId, showControls],
  )

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      {enableAutocomplete && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
          <Input
            id={inputId}
            type="text"
            placeholder="Search for a location..."
            className="w-full shadow-md"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      )}

      <div style={{ height }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={getMapCenter()}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {selectedLocation?.location && (
            <Marker
              position={selectedLocation.location}
              title={selectedLocation.name || 'Selected Location'}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng && onLocationSelect) {
                  handleMapClick(e as google.maps.MapMouseEvent)
                }
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  )
}
