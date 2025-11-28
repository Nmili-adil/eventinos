import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { MapPin } from 'lucide-react'
import type { Libraries } from '@react-google-maps/api'
import { useJsApiLoader } from '@react-google-maps/api'
import { SingleMarkerMap } from './SingleMarkerMap'
import { MultiMarkerMap } from './MultiMarkerMap'
import { LocationSelector } from './LocationSelector'

const SCRIPT_ID = 'eventinos-google-maps'
const DEFAULT_LIBRARIES: Libraries = ['marker']

interface GoogleMapsContextValue {
  isLoaded: boolean
  mapId?: string
}

const GoogleMapsContext = createContext<GoogleMapsContextValue | undefined>(undefined)

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext)
  if (!context) {
    throw new Error('useGoogleMaps must be used inside GoogleMapWrapper')
  }
  return context
}

interface GoogleMapWrapperProps {
  children: ReactNode
  libraries?: Libraries
  loadPlaces?: boolean
}

const LoadingState = () => (
  <div className="flex items-center justify-center bg-gray-50 rounded-lg border p-6">
    <div className="text-center">
      <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-b-transparent border-blue-500" />
      <p className="text-sm text-muted-foreground">Loading Google Maps…</p>
    </div>
  </div>
)

const MissingKeyState = () => (
  <div className="flex items-center justify-center bg-gray-100 rounded-lg border p-8">
    <div className="text-center">
      <MapPin className="mx-auto mb-3 h-12 w-12 text-gray-400" />
      <p className="mb-2 font-semibold text-red-500">Maps configuration required</p>
      <p className="text-sm text-muted-foreground">
        Please set VITE_GOOGLE_MAPS_API_KEY in your environment file.
      </p>
    </div>
  </div>
)

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200 p-6">
    <div className="text-center">
      <MapPin className="mx-auto mb-3 h-10 w-10 text-red-400" />
      <p className="font-semibold text-red-600">Unable to load Google Maps</p>
      <p className="mt-1 text-sm text-red-500">{message}</p>
    </div>
  </div>
)

interface GoogleMapsProviderImplProps {
  children: ReactNode
  apiKey: string
  mapId?: string
  libraries: Libraries
}

const GoogleMapsProviderImpl = ({
  children,
  apiKey,
  mapId,
  libraries,
}: GoogleMapsProviderImplProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: SCRIPT_ID,
    googleMapsApiKey: apiKey,
    mapIds: mapId ? [mapId] : undefined,
    libraries,
    preventGoogleFontsLoading: true,
  })

  if (loadError) {
    return <ErrorState message={loadError.message} />
  }

  if (!isLoaded) {
    return <LoadingState />
  }

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, mapId }}>
      {children}
    </GoogleMapsContext.Provider>
  )
}

export const GoogleMapWrapper = ({
  children,
  libraries = [],
  loadPlaces = false,
}: GoogleMapWrapperProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID

  const requestedLibraries = useMemo<Libraries>(() => {
    const merged = [...DEFAULT_LIBRARIES]
    if (loadPlaces) merged.push('places')
    libraries.forEach(library => {
      if (!merged.includes(library)) {
        merged.push(library)
      }
    })
    return merged
  }, [libraries, loadPlaces])

  if (!apiKey) {
    return <MissingKeyState />
  }

  return (
    <GoogleMapsProviderImpl apiKey={apiKey} mapId={mapId} libraries={requestedLibraries}>
      {children}
    </GoogleMapsProviderImpl>
  )
}

export { SingleMarkerMap, MultiMarkerMap, LocationSelector }
export type { LocationCoordinates, LocationValue, MapMarker, BaseMapProps } from './types'

export default {
  Wrapper: GoogleMapWrapper,
  Single: SingleMarkerMap,
  Multi: MultiMarkerMap,
  Selector: LocationSelector,
}
