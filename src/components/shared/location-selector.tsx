// import { useCallback, useEffect, useMemo, useState } from 'react'
// import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group'
// import { MapPin, Crosshair, Compass } from 'lucide-react'
// import { GoogleMapWrapper, useGoogleMaps } from '@/components/shared/GoogleMap'

// interface Coordinates {
//   lat: number
//   lng: number
// }

// export interface LocationValue {
//   name?: string
//   address?: string
//   city?: string
//   country?: string
//   countryCode?: string
//   place_id?: string
//   location?: Coordinates | { lat: number; lng: number } | null
// }

// interface LocationSelectorProps {
//   value?: LocationValue
//   onChange: (value: LocationValue) => void
//   defaultMode?: 'manual' | 'map'
// }

// const DEFAULT_CENTER: Coordinates = { lat: 33.5731, lng: -7.5898 }
// const MAP_CONTAINER_STYLE = { width: '100%', height: '320px' }

// interface MapPickerProps {
//   value?: LocationValue
//   coordinates: Coordinates | null
//   onChange: (value: LocationValue) => void
// }

// const MapPicker = ({ value, coordinates, onChange }: MapPickerProps) => {
//   const { mapId } = useGoogleMaps()
//   const [mapCenter, setMapCenter] = useState<Coordinates>(coordinates ?? DEFAULT_CENTER)
//   const [map, setMap] = useState<google.maps.Map | null>(null)
//   const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null)
//   const [searchValue, setSearchValue] = useState('')
//   const [isGeolocating, setIsGeolocating] = useState(false)

//   useEffect(() => {
//     if (coordinates) {
//       setMapCenter(coordinates)
//       if (map) {
//         map.panTo(coordinates)
//         map.setZoom(14)
//       }
//     }
//   }, [coordinates, map])

//   const mapOptions = useMemo(
//     () => ({
//       mapId,
//       streetViewControl: false,
//       mapTypeControl: false,
//       fullscreenControl: false,
//       zoomControl: true,
//       disableDoubleClickZoom: false,
//       clickableIcons: false,
//     }),
//     [mapId],
//   )

//   const updateLocation = useCallback(
//     (location: Coordinates, details?: Partial<LocationValue>) => {
//       onChange({
//         ...value,
//         ...details,
//         location,
//       })
//     },
//     [onChange, value],
//   )

//   const handlePlacesChanged = () => {
//     const places = searchBox?.getPlaces()
//     if (!places || !places.length) return

//     const place = places[0]
//     const geometry = place.geometry
//     if (!geometry?.location) return

//     const lat = geometry.location.lat()
//     const lng = geometry.location.lng()
//     const newCenter = { lat, lng }
//     setMapCenter(newCenter)
//     map?.panTo(newCenter)
//     map?.setZoom(15)

//     const components = place.address_components ?? []
//     const findComponent = (type: string) =>
//       components.find(component => component.types.includes(type))

//     updateLocation(
//       newCenter,
//       {
//         name: place.name || value?.name,
//         address: place.formatted_address || value?.address,
//         city: findComponent('locality')?.long_name || value?.city,
//         country: findComponent('country')?.long_name || value?.country,
//         countryCode: findComponent('country')?.short_name || value?.countryCode,
//         place_id: place.place_id || value?.place_id,
//       },
//     )
//   }

//   const handleMapClick = (event: google.maps.MapMouseEvent) => {
//     if (!event.latLng) return
//     const lat = event.latLng.lat()
//     const lng = event.latLng.lng()
//     updateLocation({ lat, lng })
//   }

//   const handleMarkerDrag = (event: google.maps.MapMouseEvent) => {
//     if (!event.latLng) return
//     const lat = event.latLng.lat()
//     const lng = event.latLng.lng()
//     updateLocation({ lat, lng })
//   }

//   const handleUseCurrentLocation = () => {
//     if (!navigator.geolocation) return
//     setIsGeolocating(true)
//     navigator.geolocation.getCurrentPosition(
//       position => {
//         const coords = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         }
//         setMapCenter(coords)
//         map?.panTo(coords)
//         map?.setZoom(15)
//         updateLocation(coords)
//         setIsGeolocating(false)
//       },
//       () => setIsGeolocating(false),
//       { enableHighAccuracy: true, timeout: 10000 },
//     )
//   }

//   return (
//     <div className="space-y-3">
//       <div className="flex flex-col gap-2 md:flex-row">
//         <StandaloneSearchBox onLoad={ref => setSearchBox(ref)} onPlacesChanged={handlePlacesChanged}>
//           <Input
//             value={searchValue}
//             onChange={(e) => setSearchValue(e.target.value)}
//             placeholder="Search for a venue or address"
//             className="flex-1"
//           />
//         </StandaloneSearchBox>
//         <Button
//           type="button"
//           variant="outline"
//           onClick={handleUseCurrentLocation}
//           disabled={isGeolocating}
//         >
//           <Crosshair className="mr-2 h-4 w-4" />
//           {isGeolocating ? 'Locating...' : 'Use my location'}
//         </Button>
//       </div>

//       <div className="overflow-hidden rounded-lg border">
//         <GoogleMap
//           mapContainerStyle={MAP_CONTAINER_STYLE}
//           options={mapOptions}
//           center={mapCenter}
//           zoom={coordinates ? 14 : 5}
//           onLoad={setMap}
//           onClick={handleMapClick}
//         >
//           {coordinates && (
//             <Marker
//               position={coordinates}
//               draggable
//               onDragEnd={handleMarkerDrag}
//             />
//           )}
//         </GoogleMap>
//       </div>

//       {coordinates ? (
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           <Compass className="h-4 w-4" />
//           <span>
//             Lat: {coordinates.lat.toFixed(5)}, Lng: {coordinates.lng.toFixed(5)}
//           </span>
//         </div>
//       ) : (
//         <p className="flex items-center gap-2 text-sm text-muted-foreground">
//           <MapPin className="h-4 w-4" />
//           Click the map to drop a pin for your event.
//         </p>
//       )}
//     </div>
//   )
// }

// export const LocationSelector = ({
//   value,
//   onChange,
//   defaultMode = 'manual',
// }: LocationSelectorProps) => {
//   const [mode, setMode] = useState<'manual' | 'map'>(defaultMode)

//   const coordinates = useMemo(() => {
//     if (!value?.location) return null
//     if ('lat' in (value.location as Coordinates)) {
//       return value.location as Coordinates
//     }
//     return null
//   }, [value])

//   const handleCoordinateInput = (axis: 'lat' | 'lng', val: string) => {
//     const numeric = parseFloat(val)
//     if (Number.isNaN(numeric)) return
//     const current = coordinates ?? { lat: 0, lng: 0 }
//     const updated = axis === 'lat' ? { lat: numeric, lng: current.lng } : { lat: current.lat, lng: numeric }
//     onChange({
//       ...value,
//       location: updated,
//     })
//   }

//   return (
//     <div className="space-y-4">
//       <RadioGroup
//         value={mode}
//         onValueChange={(v) => setMode(v as 'manual' | 'map')}
//         className="flex gap-4"
//       >
//         <div className="flex items-center space-x-2 rounded border p-3 flex-1 bg-slate-100 hover:bg-slate-200 border-slate-200">
//           <RadioGroupItem value="manual" id="manual-location" />
//           <Label htmlFor="manual-location" className="font-medium w-full h-full">
//             Enter manually
//           </Label>
//         </div>
//         <div className="flex items-center space-x-2 rounded border p-3 flex-1 bg-slate-100 hover:bg-slate-200 border-slate-200">
//           <RadioGroupItem value="map" id="map-location" />
//           <Label htmlFor="map-location" className="font-medium w-full h-full">
//             Select via Google Maps
//           </Label>
//         </div>
//       </RadioGroup>

//       {mode === 'map' ? (
//         <GoogleMapWrapper loadPlaces>
//           <MapPicker value={value} coordinates={coordinates} onChange={onChange} />
//         </GoogleMapWrapper>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label>Venue Name</Label>
//             <Input
//               value={value?.name || ''}
//               placeholder="Venue"
//               onChange={(e) => onChange({ ...value, name: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Address</Label>
//             <Input
//               value={value?.address || ''}
//               placeholder="Street, area"
//               onChange={(e) => onChange({ ...value, address: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>City</Label>
//             <Input
//               value={value?.city || ''}
//               placeholder="City"
//               onChange={(e) => onChange({ ...value, city: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Country</Label>
//             <Input
//               value={value?.country || ''}
//               placeholder="Country"
//               onChange={(e) => onChange({ ...value, country: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Country Code</Label>
//             <Input
//               value={value?.countryCode || ''}
//               placeholder="US"
//               onChange={(e) => onChange({ ...value, countryCode: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Place ID (optional)</Label>
//             <Input
//               value={value?.place_id || ''}
//               placeholder="Google Places ID"
//               onChange={(e) => onChange({ ...value, place_id: e.target.value })}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Latitude</Label>
//             <Input
//               type="number"
//               step="any"
//               value={coordinates?.lat ?? ''}
//               placeholder="e.g., 40.7128"
//               onChange={(e) => handleCoordinateInput('lat', e.target.value)}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Longitude</Label>
//             <Input
//               type="number"
//               step="any"
//               value={coordinates?.lng ?? ''}
//               placeholder="e.g., -74.0060"
//               onChange={(e) => handleCoordinateInput('lng', e.target.value)}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group'
import { MapPin, Crosshair } from 'lucide-react'

interface Coordinates {
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
  location?: Coordinates | { lat: number; lng: number } | null
}

interface LocationSelectorProps {
  value?: LocationValue
  onChange: (value: LocationValue) => void
  defaultMode?: 'manual' | 'map'
}

export const LocationSelector = ({
  value,
  onChange,
  defaultMode = 'manual',
}: LocationSelectorProps) => {
  const [mode, setMode] = useState<'manual' | 'map'>(defaultMode)

  const coordinates = useMemo(() => {
    if (!value?.location) return null
    if ('lat' in (value.location as Coordinates)) {
      return value.location as Coordinates
    }
    return null
  }, [value])

  const handleCoordinateInput = (axis: 'lat' | 'lng', val: string) => {
    const numeric = parseFloat(val)
    if (Number.isNaN(numeric)) return
    const current = coordinates ?? { lat: 0, lng: 0 }
    const updated = axis === 'lat' ? { lat: numeric, lng: current.lng } : { lat: current.lat, lng: numeric }
    onChange({
      ...value,
      location: updated,
    })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return
    
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        onChange({
          ...value,
          location: coords,
        })
      },
      (error) => {
        console.error('Error getting location:', error)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={mode}
        onValueChange={(v) => setMode(v as 'manual' | 'map')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2 rounded border p-3 flex-1 bg-slate-100 hover:bg-slate-200 border-slate-200">
          <RadioGroupItem value="manual" id="manual-location" />
          <Label htmlFor="manual-location" className="font-medium w-full h-full">
            Enter manually
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded border p-3 flex-1 bg-slate-100 hover:bg-slate-200 border-slate-200">
          <RadioGroupItem value="map" id="map-location" />
          <Label htmlFor="map-location" className="font-medium w-full h-full">
            Use current location
          </Label>
        </div>
      </RadioGroup>

      {mode === 'map' ? (
        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span>Use your current location or enter coordinates manually</span>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleUseCurrentLocation}
            className="w-full"
          >
            <Crosshair className="mr-2 h-4 w-4" />
            Use my current location
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={coordinates?.lat ?? ''}
                placeholder="e.g., 40.7128"
                onChange={(e) => handleCoordinateInput('lat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={coordinates?.lng ?? ''}
                placeholder="e.g., -74.0060"
                onChange={(e) => handleCoordinateInput('lng', e.target.value)}
              />
            </div>
          </div>

          {coordinates && (
            <div className="text-sm text-muted-foreground mt-2">
              Current coordinates: Lat: {coordinates.lat.toFixed(5)}, Lng: {coordinates.lng.toFixed(5)}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Venue Name</Label>
            <Input
              value={value?.name || ''}
              placeholder="Venue"
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={value?.address || ''}
              placeholder="Street, area"
              onChange={(e) => onChange({ ...value, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={value?.city || ''}
              placeholder="City"
              onChange={(e) => onChange({ ...value, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={value?.country || ''}
              placeholder="Country"
              onChange={(e) => onChange({ ...value, country: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Country Code</Label>
            <Input
              value={value?.countryCode || ''}
              placeholder="US"
              onChange={(e) => onChange({ ...value, countryCode: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Place ID (optional)</Label>
            <Input
              value={value?.place_id || ''}
              placeholder="Google Places ID"
              onChange={(e) => onChange({ ...value, place_id: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              type="number"
              step="any"
              value={coordinates?.lat ?? ''}
              placeholder="e.g., 40.7128"
              onChange={(e) => handleCoordinateInput('lat', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              type="number"
              step="any"
              value={coordinates?.lng ?? ''}
              placeholder="e.g., -74.0060"
              onChange={(e) => handleCoordinateInput('lng', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}