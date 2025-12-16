import { useCallback, useMemo, useState } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LocationCoordinates, BaseMapProps } from './types'
import { useGoogleMaps } from './index'

interface SingleMarkerMapProps extends BaseMapProps {
  location?: LocationCoordinates | [number, number] | null
  name?: string
  address?: string
}

const defaultCenter: LocationCoordinates = {
  lat: 31.792306, // Casablanca
  lng: -7.080168,
}

export const SingleMarkerMap = ({
  location,
  name = 'Event Location',
  address = '',
  height = '400px',
  zoom = 15,
  className = '',
  showControls = true,
  onMapReady,
}: SingleMarkerMapProps) => {
  const { mapId } = useGoogleMaps()
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false)
  const handleMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      if (onMapReady) {
        onMapReady(mapInstance)
      }
    },
    [onMapReady],
  )

  const getCoordinates = (): LocationCoordinates | null => {
    if (!location) return null

    try {
      if (Array.isArray(location)) {
        return { lat: location[1], lng: location[0] }
      } else if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
        return { lat: location.lat, lng: location.lng }
      }
    } catch (error) {
      console.error('Error parsing location:', error)
    }
    return null
  }

  const coordinates = getCoordinates()
  const center = coordinates || defaultCenter
  const mapZoom = coordinates ? zoom : 2

  const getDirectionsUrl = () => {
    if (!coordinates) return '#'
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
  }

  const getMapsUrl = () => {
    if (!coordinates) return '#'
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
  }

  const mapOptions = useMemo(
    () => ({
      mapId,
      streetViewControl: showControls,
      mapTypeControl: showControls,
      fullscreenControl: showControls,
      zoomControl: showControls,
      disableDefaultUI: !showControls,
    }),
    [mapId, showControls],
  )

  return (
    <div className={`relative rounded-lg overflow-hidden border bg-white ${className}`} style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={mapZoom}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
        {coordinates && (
          <Marker
            position={coordinates}
            title={name}
            onClick={() => setIsInfoWindowOpen(true)}
          />
        )}

        {coordinates && isInfoWindowOpen && (
          <InfoWindow
            position={coordinates}
            onCloseClick={() => setIsInfoWindowOpen(false)}
          >
            <div className="p-3 max-w-xs">
              <div className="flex items-start space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">{name}</h3>
                  {address && <p className="text-xs text-gray-600 mt-1">{address}</p>}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="text-xs h-8" asChild>
                  <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-3 w-3 mr-1" />
                    Directions
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                  <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Maps
                  </a>
                </Button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* No location message */}
      {!coordinates && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Location not available</p>
            <p className="text-sm text-gray-400 mt-1">No coordinates provided for mapping</p>
          </div>
        </div>
      )}
    </div>
  )
}
