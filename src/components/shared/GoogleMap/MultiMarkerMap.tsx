import { useState, useCallback, useEffect, useMemo } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import type { LocationCoordinates, MapMarker, BaseMapProps } from './types'
import { useGoogleMaps } from './index'

interface MultiMarkerMapProps extends BaseMapProps {
  markers: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  selectedMarkerId?: string | null
  fitBounds?: boolean
}

const defaultCenter: LocationCoordinates = {
  lat: 31.792306, // Casablanca
  lng: -7.080168,
}

export const MultiMarkerMap = ({
  markers = [],
  onMarkerClick,
  selectedMarkerId,
  height = '600px',
  zoom = 7,
  center,
  showControls = true,
  className = '',
  fitBounds = true,
  onMapReady,
}: MultiMarkerMapProps) => {
  const { mapId } = useGoogleMaps()
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const googleMaps = typeof window !== 'undefined' ? window.google : undefined

  // Calculate map bounds based on markers
  const mapBounds = useMemo(() => {
    if (markers.length === 0 || !googleMaps?.maps) return null
    const bounds = new googleMaps.maps.LatLngBounds()
    markers.forEach(marker => {
      bounds.extend(marker.position)
    })
    return bounds
  }, [markers, googleMaps])

  // Determine map center
  const getMapCenter = () => {
    if (center) return center
    if (markers.length === 1) return markers[0].position
    return defaultCenter
  }

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
    if (fitBounds && mapBounds) {
      mapInstance.fitBounds(mapBounds)
    }
    if (onMapReady) {
      onMapReady(mapInstance)
    }
  }, [mapBounds, fitBounds, onMapReady])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Update map bounds when markers change
  useEffect(() => {
    if (map && fitBounds && mapBounds) {
      map.fitBounds(mapBounds)
    }
  }, [map, mapBounds, fitBounds])

  // Update selected marker when selectedMarkerId changes
  useEffect(() => {
    if (selectedMarkerId) {
      const marker = markers.find(m => m.id === selectedMarkerId)
      if (marker) {
        setSelectedMarker(marker)
        if (map) {
          map.setCenter(marker.position)
          map.setZoom(12)
        }
      }
    } else {
      setSelectedMarker(null)
    }
  }, [selectedMarkerId, markers, map])

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
    if (onMarkerClick) {
      onMarkerClick(marker)
    }
    if (marker.onClick) {
      marker.onClick()
    }
    if (map) {
      map.setCenter(marker.position)
      map.setZoom(12)
    }
  }

  const mapOptions = useMemo(
    () => ({
      mapId,
      disableDefaultUI: false,
      zoomControl: showControls,
      streetViewControl: false,
      mapTypeControl: showControls,
      fullscreenControl: showControls,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    }),
    [mapId, showControls],
  )

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={getMapCenter()}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            onClick={() => handleMarkerClick(marker)}
            icon={
              marker.icon ||
              (googleMaps?.maps
                ? {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new googleMaps.maps.Size(32, 32),
                  }
                : undefined)
            }
          />
        ))}

        {selectedMarker && selectedMarker.info && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              maxWidth: 300,
            }}
          >
            <div>{selectedMarker.info}</div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
