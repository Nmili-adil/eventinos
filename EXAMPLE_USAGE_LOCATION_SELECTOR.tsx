import { useState } from 'react'
import { LocationSelector, type LocationValue } from '@/components/shared/location-selector'
import { LocationPicker } from '@/components/shared/LocationPicker'
import { MapLocationSelector } from '@/components/shared/MapLocationSelector'

/**
 * Example file demonstrating all ways to use the modern location selector
 * 
 * Features:
 * - Interactive map with click-to-pin
 * - Real-time search autocomplete
 * - Geolocation support
 * - Manual coordinate entry
 * - Beautiful animations
 * - Mobile responsive
 */

// Example 1: Using LocationPicker in a form (Recommended for most cases)
export function EventFormWithLocationPicker() {
  const [location, setLocation] = useState<LocationValue>()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Event Location Selected:', location)
    setSubmitted(true)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Event - Location Picker</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Event Name</label>
          <input
            type="text"
            placeholder="My Awesome Event"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <LocationPicker
          value={location}
          onChange={setLocation}
          label="Event Venue Location"
          required={true}
          description="Select where your event will take place"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Event
        </button>
      </form>

      {submitted && location && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">✓ Event Location Saved!</h3>
          <pre className="text-sm text-green-800 overflow-auto">
            {JSON.stringify(location, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// Example 2: Using LocationSelector with mode toggle
export function EventFormWithTabs() {
  const [location, setLocation] = useState<LocationValue>()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Event - Tab Selection</h1>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Where will your event be?</h2>

        <LocationSelector
          value={location}
          onChange={setLocation}
          defaultMode="map"
        />

        {location?.location && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📍 Location Confirmed</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {location.name && <p><strong>Venue:</strong> {location.name}</p>}
              {location.address && <p><strong>Address:</strong> {location.address}</p>}
              {location.city && <p><strong>City:</strong> {location.city}, {location.country}</p>}
              <p><strong>Coordinates:</strong> {location.location.lat.toFixed(5)}, {location.location.lng.toFixed(5)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Example 3: Standalone map component
export function LocationSearchWidget() {
  const [location, setLocation] = useState<LocationValue>()

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Find Venues</h1>
      <p className="text-gray-600 mb-6">Search or click the map to find event locations</p>

      <MapLocationSelector
        value={location}
        onChange={setLocation}
        height="500px"
        zoom={13}
        enableSearch={true}
        enableGeolocation={true}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Raw Data</h3>
          <pre className="text-xs overflow-auto max-h-64 bg-white p-3 rounded border">
            {JSON.stringify(location, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Selected Info</h3>
          {location ? (
            <div className="text-sm space-y-2">
              {location.name && (
                <div><span className="font-medium">Venue:</span> {location.name}</div>
              )}
              {location.address && (
                <div><span className="font-medium">Address:</span> {location.address}</div>
              )}
              {location.city && (
                <div><span className="font-medium">Location:</span> {location.city}, {location.country}</div>
              )}
              {location.location && (
                <div><span className="font-medium">GPS:</span> {location.location.lat.toFixed(4)}, {location.location.lng.toFixed(4)}</div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No location selected yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Example 4: Advanced form with location validation
export function AdvancedEventForm() {
  const [location, setLocation] = useState<LocationValue>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleLocationChange = (newLocation: LocationValue) => {
    setLocation(newLocation)
    // Clear error when user selects a location
    if (newLocation.location) {
      setErrors(prev => {
        const next = { ...prev }
        delete next.location
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!location?.location) {
      newErrors.location = 'Please select a location'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Form submitted with valid location:', location)
    // Send to API
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Advanced Event Form</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Picker with error handling */}
        <div>
          <LocationPicker
            value={location}
            onChange={handleLocationChange}
            label="Event Location"
            required={true}
            description="Select where your event will be held"
          />
          {errors.location && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {errors.location}
            </div>
          )}
        </div>

        {/* Form submission */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
        >
          Create Event
        </button>
      </form>

      {/* Location details display */}
      {location?.location && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Location Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {location.name && (
              <div className="p-4 bg-white border rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Venue Name</div>
                <div className="text-lg font-semibold text-gray-900">{location.name}</div>
              </div>
            )}

            {location.address && (
              <div className="p-4 bg-white border rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Address</div>
                <div className="text-lg font-semibold text-gray-900">{location.address}</div>
              </div>
            )}

            {location.city && (
              <div className="p-4 bg-white border rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide">City</div>
                <div className="text-lg font-semibold text-gray-900">
                  {location.city}, {location.country}
                </div>
              </div>
            )}

            {location.location && (
              <div className="p-4 bg-white border rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Coordinates</div>
                <div className="text-sm font-mono text-gray-900">
                  {location.location.lat.toFixed(5)}, {location.location.lng.toFixed(5)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Example 5: Comparison view - Manual vs Map
export function LocationSelectionComparison() {
  const [manualLocation, setManualLocation] = useState<LocationValue>()
  const [mapLocation, setMapLocation] = useState<LocationValue>()

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Location Selection Methods</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Entry */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">📝 Manual Entry</h2>
          <LocationSelector
            value={manualLocation}
            onChange={setManualLocation}
            defaultMode="manual"
          />
          {manualLocation?.location && (
            <div className="mt-4 p-3 bg-white rounded border">
              <pre className="text-xs overflow-auto">{JSON.stringify(manualLocation, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Interactive Map */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">🗺️ Interactive Map</h2>
          <MapLocationSelector
            value={mapLocation}
            onChange={setMapLocation}
            height="400px"
          />
          {mapLocation?.location && (
            <div className="mt-4 p-3 bg-white rounded border">
              <pre className="text-xs overflow-auto">{JSON.stringify(mapLocation, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Comparison results */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Manual Entry Data</h3>
          <p className="text-sm text-blue-700">
            {manualLocation?.location
              ? `✓ Location set to: ${manualLocation.city || 'Unknown'}`
              : '✗ No location selected'}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Map Selection Data</h3>
          <p className="text-sm text-green-700">
            {mapLocation?.location
              ? `✓ Location set to: ${mapLocation.city || 'Unknown'}`
              : '✗ No location selected'}
          </p>
        </div>
      </div>
    </div>
  )
}

// Export all examples
export default {
  LocationFormWithPicker: EventFormWithLocationPicker,
  LocationFormWithTabs: EventFormWithTabs,
  LocationSearchWidget,
  AdvancedEventForm,
  LocationSelectionComparison,
}
