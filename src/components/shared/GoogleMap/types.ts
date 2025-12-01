export interface LocationCoordinates {
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

export interface MapMarker {
  id: string
  position: LocationCoordinates
  title: string
  info?: React.ReactNode
  onClick?: () => void
  icon?: string | google.maps.Icon
}

export interface BaseMapProps {
  height?: string
  zoom?: number
  center?: LocationCoordinates
  showControls?: boolean
  className?: string
  onMapReady?: (map: google.maps.Map) => void
}

export interface MultiMarkerMapProps extends BaseMapProps {
  markers?: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  selectedMarkerId?: string | null
  fitBounds?: boolean
}

interface GoogleMapsContextValue {
  isLoaded: boolean
  loadError?: Error | null
  mapId?: string
}