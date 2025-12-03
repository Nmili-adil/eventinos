// Update the imports at the top
import { useState, useCallback, useEffect, useMemo } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import type { LocationCoordinates, MapMarker, BaseMapProps, MultiMarkerMapProps } from './types'
import { useGoogleMaps } from './index'

const defaultCenter: LocationCoordinates = { lat: 40.416775, lng: -3.703790 }; // Madrid coordinates as default

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
  const { isLoaded, loadError } = useGoogleMaps()
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [mapCenter, setMapCenter] = useState<LocationCoordinates>(center || defaultCenter)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)

  // Calculate map bounds based on markers
  const mapBounds = useMemo(() => {
    if (markers.length === 0 || !window.google?.maps) return null
    const bounds = new window.google.maps.LatLngBounds()
    markers.forEach(marker => {
      bounds.extend(marker.position)
    })
    return bounds
  }, [markers])

  // Set initial map center and zoom
  useEffect(() => {
    if (center) {
      setMapCenter(center)
      setMapZoom(zoom)
    } else if (markers.length === 1) {
      setMapCenter(markers[0].position)
      setMapZoom(15)
    } else if (markers.length > 1 && mapBounds) {
      setMapZoom(zoom)
    }
  }, [center, markers, zoom, mapBounds])

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
    if (onMapReady) {
      onMapReady(mapInstance)
    }
  }, [onMapReady])

  // Update map bounds when markers change
  useEffect(() => {
    if (map && fitBounds && mapBounds && markers.length > 0) {
      map.fitBounds(mapBounds)
      // Add padding to the bounds
      map.panToBounds(mapBounds, {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      })
    }
  }, [map, mapBounds, fitBounds, markers.length])

  // Handle selected marker changes
  useEffect(() => {
    if (selectedMarkerId) {
      const marker = markers.find(m => m.id === selectedMarkerId)
      if (marker) {
        setSelectedMarker(marker)
        if (map) {
          map.panTo(marker.position)
          map.setZoom(15)
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
      map.panTo(marker.position)
      map.setZoom(15)
    }
  }

  const mapOptions = useMemo(() => ({
    disableDefaultUI: !showControls,
    zoomControl: showControls,
    streetViewControl: showControls,
    mapTypeControl: showControls,
    fullscreenControl: showControls,
    styles: [{
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    }],
  }), [showControls])

  if (loadError) {
    return <div>Error loading maps</div>
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border bg-white border-gray-200 ${className}`} style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onLoad}
        options={mapOptions}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id || `marker-${marker.position.lat}-${marker.position.lng}`}
            position={marker.position}
            title={marker.title}
            onClick={() => handleMarkerClick(marker)}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(24, 24),
            }}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              pixelOffset: new window.google.maps.Size(10, 30),
              
            }}
          >
            <div >
              {typeof selectedMarker.info === 'string' ? (
                <div style={{ minWidth: '300px', maxWidth: '280px' }}>
                  <h3 style={{ 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {selectedMarker.title}
                  </h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6b7280',
                    margin: '0',
                    lineHeight: '1.5'
                  }}>
                    {selectedMarker.info}
                  </p>
                </div>
              ) : (
                selectedMarker.info
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}