import { useEffect, useMemo, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group'
import { MapPin, Crosshair, Compass, Loader2 } from 'lucide-react'

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

// Custom hook to load Google Maps with proper async loading
const useGoogleMapsLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key not configured'))
      return
    }

    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        // Wait a bit for the API to be fully available
        setTimeout(() => setIsLoaded(true), 100)
      })
      existingScript.addEventListener('error', () => setLoadError(new Error('Failed to load Google Maps')))
      return
    }

    // Load the script with v=weekly to get latest version
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly`
    script.async = true
    script.defer = true

    const handleLoad = () => {
      // Wait for the API to be fully initialized
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.Map && window.google?.maps?.places) {
          clearInterval(checkInterval)
          setIsLoaded(true)
        }
      }, 50)
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.google?.maps?.Map) {
          setLoadError(new Error('Google Maps API failed to initialize'))
        }
      }, 5000)
    }

    const handleError = () => {
      setLoadError(new Error('Failed to load Google Maps'))
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
  }, [])

  return { isLoaded, loadError }
}

export const LocationSelector = ({
  value,
  onChange,
  defaultMode = 'manual',
}: LocationSelectorProps) => {
  const [mode, setMode] = useState<'manual' | 'map'>(defaultMode)
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 33.5731, lng: -7.5898 })
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null)
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.PlaceAutocompleteElement | null>(null)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteContainerRef = useRef<HTMLDivElement>(null)

  const { isLoaded, loadError } = useGoogleMapsLoader()

  const coordinates = useMemo(() => {
    if (!value?.location) return null
    if ('lat' in (value.location as any) && typeof (value.location as any).lat === 'number') {
      return value.location as Coordinates
    }
    return null
  }, [value])

  // Initialize map once when script is loaded (not dependent on mode)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return

    try {
      // Verify that google.maps.Map is available
      if (typeof google?.maps?.Map !== 'function') {
        console.error('google.maps.Map is not available')
        return
      }

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: coordinates ? 14 : 5,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        mapId: 'DEMO_MAP_ID', // Required for Advanced Markers
      })

      mapInstance.addListener('click', handleMapClick)
      setMap(mapInstance)

      // Add marker if coordinates exist
      if (coordinates) {
        addMarker(coordinates, mapInstance)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [isLoaded, map])
  
  // Update map center when coordinates change
  useEffect(() => {
    if (map && coordinates) {
      map.setCenter(coordinates)
      map.setZoom(14)
    }
  }, [map, coordinates])

  // Initialize PlaceAutocompleteElement (modern Google Places API)
  useEffect(() => {
    if (mode !== 'map' || !isLoaded || !autocompleteContainerRef.current) return

    // Clean up existing autocomplete when switching away from map mode
    if (placeAutocomplete) {
      return // Already initialized
    }

    try {
      // Wait for the PlaceAutocompleteElement to be defined
      if (!customElements.get('gmp-place-autocomplete')) {
        console.error('PlaceAutocompleteElement not yet defined, waiting...')
        // Retry after a short delay
        const timeout = setTimeout(() => {
          setPlaceAutocomplete(null) // Trigger re-render
        }, 500)
        return () => clearTimeout(timeout)
      }

      // Create the PlaceAutocompleteElement
      const autocompleteElement = document.createElement('gmp-place-autocomplete') as google.maps.places.PlaceAutocompleteElement
      
      // Set attributes for styling
      autocompleteElement.setAttribute('placeholder', 'Search location or place')
      autocompleteElement.style.width = '100%'
      autocompleteElement.style.minHeight = '40px'

      // Add event listener for place selection
      autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
        const place = event.place
        if (!place) return

        try {
          // Fetch additional place details
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location', 'addressComponents', 'id']
          })

          if (place.location) {
            const lat = place.location.lat()
            const lng = place.location.lng()
            setMapCenter({ lat, lng })

            // Extract address components
            const addressComponents = place.addressComponents || []
            const city = addressComponents.find((c: any) => c.types.includes('locality'))?.longText
            const country = addressComponents.find((c: any) => c.types.includes('country'))?.longText
            const countryCode = addressComponents.find((c: any) => c.types.includes('country'))?.shortText

            onChange({
              ...value,
              name: place.displayName || value?.name,
              address: place.formattedAddress || value?.address,
              city: city || value?.city,
              country: country || value?.country,
              countryCode: countryCode || value?.countryCode,
              place_id: place.id || value?.place_id,
              location: { lat, lng },
            })
          }
        } catch (error) {
          console.error('Error fetching place details:', error)
        }
      })

      // Append to container
      autocompleteContainerRef.current.appendChild(autocompleteElement)
      setPlaceAutocomplete(autocompleteElement)
    } catch (error) {
      console.error('Error initializing PlaceAutocompleteElement:', error)
    }
  }, [mode, isLoaded, placeAutocomplete])

  // Cleanup PlaceAutocompleteElement when switching to manual mode
  useEffect(() => {
    if (mode === 'manual' && placeAutocomplete && autocompleteContainerRef.current) {
      try {
        autocompleteContainerRef.current.removeChild(placeAutocomplete)
        setPlaceAutocomplete(null)
      } catch (e) {
        console.error('Error removing PlaceAutocompleteElement:', e)
      }
    }
  }, [mode, placeAutocomplete])

  // Update marker when coordinates change
  useEffect(() => {
    if (map && coordinates) {
      addMarker(coordinates, map)
    } else if (marker && map) {
      marker.map = null
      setMarker(null)
    }
  }, [coordinates, map])

  const addMarker = (position: Coordinates, mapInstance: google.maps.Map) => {
    try {
      // Use AdvancedMarkerElement if available, fallback to regular Marker
      if (google.maps.marker?.AdvancedMarkerElement) {
        if (marker) {
          marker.position = position
          marker.map = mapInstance
          return
        }

        const newMarker = new google.maps.marker.AdvancedMarkerElement({
          position,
          map: mapInstance,
          gmpDraggable: true,
        })

        newMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            handleMapClick(event)
          }
        })

        setMarker(newMarker)
      } else {
        // Fallback to regular Marker
        if (marker) {
          (marker as any).setPosition(position)
          return
        }

        const newMarker = new google.maps.Marker({
          position,
          map: mapInstance,
          draggable: true,
        })

        newMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            handleMapClick(event)
          }
        })

        setMarker(newMarker as any)
      }
    } catch (error) {
      console.error('Error adding marker:', error)
    }
  }



  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    
    onChange({
      ...value,
      location: { lat, lng },
    })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.')
      return
    }
    
    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setMapCenter(coords)
        onChange({
          ...value,
          location: coords,
        })
        setIsGeolocating(false)
      },
      (error) => {
        console.error('Error getting current location:', error)
        setIsGeolocating(false)
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    )
  }

  const handleCoordinateInput = (axis: 'lat' | 'lng', val: string) => {
    const numeric = parseFloat(val)
    if (Number.isNaN(numeric)) {
      return
    }
    const current = coordinates ?? { lat: 0, lng: 0 }
    const updated =
      axis === 'lat' ? { lat: numeric, lng: current.lng } : { lat: current.lat, lng: numeric }
    onChange({
      ...value,
      location: updated,
    })
  }

  if (loadError) {
    return (
      <div className="p-4 rounded-lg border border-dashed text-sm text-muted-foreground">
        Error loading Google Maps: {loadError.message}
      </div>
    )
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-4 rounded-lg border border-dashed text-sm text-muted-foreground">
        Please configure <code>VITE_GOOGLE_MAPS_API_KEY</code> to enable map features.
      </div>
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
            Select via Google Maps
          </Label>
        </div>
      </RadioGroup>

      {mode === 'map' ? (
        <div className="space-y-3">
          {!isLoaded && (
            <div className="flex items-center justify-center h-20 border rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading Google Maps...</span>
            </div>
          )}
          
          {isLoaded && (
            <>
              <div className="flex gap-2 items-start">
                {/* Modern PlaceAutocompleteElement web component */}
                <div 
                  ref={autocompleteContainerRef} 
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={isGeolocating}
                >
                  {isGeolocating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-4 h-4 mr-2" />
                      Use my location
                    </>
                  )}
                </Button>
              </div>
              
              <div className="rounded-lg overflow-hidden border">
                <div 
                ref={mapRef} 
                style={{ 
                  width: '100%', 
                  height: '300px',
                  display: mode === 'map' ? 'block' : 'none'
                }}
              />
              </div>
              
              {coordinates ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Compass className="w-4 h-4" />
                  <span>
                    Lat: {coordinates.lat.toFixed(5)}, Lng: {coordinates.lng.toFixed(5)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Click on the map to drop a marker
                </p>
              )}
            </>
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