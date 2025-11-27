// components/shared/google-map-enhanced.tsx
import { useState, useCallback } from 'react';
import { LoadScript, Marker, InfoWindow, GoogleMap } from '@react-google-maps/api';

interface GoogleMapProps {
  location?: [number, number] | { lat: number; lng: number } | null;
  name?: string;
  address?: string;
  height?: string;
  zoom?: number;
  className?: string;
  showControls?: boolean;
}

const GoogleMapComponent = ({
  location,
  name = "Event Location",
  address = "",
  height = "400px",
  zoom = 15,
  className = "",
  showControls = true,
}: GoogleMapProps) => {
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const getCoordinates = () => {
    if (!location) return null;

    try {
      if (Array.isArray(location)) {
        return { lat: location[1], lng: location[0] };
      } else if (typeof location === 'object') {
        if ('lat' in location && 'lng' in location) {
          return { lat: location.lat, lng: location.lng };
        }
      }
    } catch (error) {
      console.error('Error parsing location:', error);
    }
    return null;
  };

  const coordinates = getCoordinates();
  const center = coordinates || { lat: 0, lng: 0 };
  const mapZoom = coordinates ? zoom : 2;

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onLoadError = useCallback((error: Error) => {
    console.error('Error loading Google Maps:', error);
    setIsLoaded(false);
  }, []);

  const getDirectionsUrl = () => {
    if (!coordinates) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}&destination_place_id=${name}`;
  };

  const getMapsUrl = () => {
    if (!coordinates) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}&query_place_id=${name}`;
  };

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg border ${className}`} style={{ height }}>
        <div className="text-center p-4">
          <p className="text-red-500 font-semibold mb-2">Maps Configuration Required</p>
          <p className="text-sm text-muted-foreground">Please configure Google Maps API key</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border bg-white ${className}`} style={{ height }}>
      <LoadScript 
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        onLoad={() => setIsLoaded(true)}
        onError={onLoadError}
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height }}
          center={center}
          zoom={mapZoom}
          onLoad={onLoad}
          options={{
            streetViewControl: showControls,
            mapTypeControl: showControls,
            fullscreenControl: showControls,
            zoomControl: showControls,
          }}
        >
          {coordinates && isLoaded && (
            <Marker
              position={coordinates}
              title={name}
              onClick={() => setIsInfoWindowOpen(true)}
            />
          )}

          {/* Marker is managed via useEffect with AdvancedMarkerElement */}

          {coordinates && isInfoWindowOpen && isLoaded && (
            <InfoWindow
              position={coordinates}
              onCloseClick={() => setIsInfoWindowOpen(false)}
            >
              <div className="p-3 max-w-xs">
                <h3 className="font-semibold text-sm mb-1">{name}</h3>
                {address && <p className="text-xs text-gray-600">{address}</p>}
                <div className="mt-2 text-xs">
                  <a 
                    href={getDirectionsUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Get Directions
                  </a>
                  <a 
                    href={getMapsUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {!coordinates && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <p className="text-gray-500 font-medium">Location not available</p>
            <p className="text-sm text-gray-400 mt-1">No coordinates provided for mapping</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;