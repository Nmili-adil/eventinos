// components/shared/google-map-enhanced.tsx
import { useState, useCallback } from 'react';
import { LoadScript, Marker, InfoWindow, GoogleMap } from '@react-google-maps/api';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Safe reference to google.maps.Animation
  const getAnimation = () => {
    return typeof google !== 'undefined' ? google.maps.Animation.DROP : undefined;
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
              animation={getAnimation()}
            />
          )}

          {coordinates && isInfoWindowOpen && isLoaded && (
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
      </LoadScript>

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
  );
};

export default GoogleMapComponent;