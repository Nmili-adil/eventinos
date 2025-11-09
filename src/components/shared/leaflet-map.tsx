import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  location: {
    lat: number;
    lng: number;
  };
  name?: string;
  address?: string;
  zoom?: number;
  height?: number;
  className?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  location,
  name = "Event Location",
  address,
  zoom = 15,
  height = 300,
  className = "p-0"
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height: `${height}px` }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="p-3 m-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Event Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-0">
        <div style={{ height: `${height}px` }} className="w-full">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            className="rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold text-sm">{name}</h3>
                  {address && <p className="text-xs text-gray-600 mt-1">{address}</p>}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        {address && (
          <div className="p-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">{address}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeafletMap;