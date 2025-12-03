# Modern Map Location Selector - Documentation

## Overview

A beautiful, fully-featured location selection component for your Eventinos application. This system provides multiple ways to select event locations with an interactive map interface.

## Features

✨ **Interactive Map** - Click to drop pins on OpenStreetMap  
🔍 **Real-time Search** - Search for venues, addresses, and locations worldwide  
📍 **Geolocation** - One-click access to user's current location  
🎯 **Manual Entry** - Enter coordinates or venue details manually  
🔄 **Draggable Markers** - Adjust location by dragging pins  
📋 **Auto-geocoding** - Automatic address lookup from coordinates  
🎨 **Modern UI** - Clean, responsive design with smooth animations  
📱 **Mobile Friendly** - Works perfectly on all devices  
🌙 **Dark Mode** - Full dark mode support  

## Components

### 1. MapLocationSelector
The main map component with search and geolocation features.

```tsx
import { MapLocationSelector, type LocationValue } from '@/components/shared/MapLocationSelector'

<MapLocationSelector
  value={selectedLocation}
  onChange={(location) => console.log(location)}
  height="400px"
  enableSearch={true}
  enableGeolocation={true}
/>
```

**Props:**
- `value?: LocationValue` - Current selected location
- `onChange: (value: LocationValue) => void` - Callback when location changes
- `height?: string` - Map container height (default: "400px")
- `center?: LocationCoordinates` - Initial map center
- `zoom?: number` - Initial zoom level (default: 13)
- `enableSearch?: boolean` - Show search functionality (default: true)
- `enableGeolocation?: boolean` - Show geolocation button (default: true)

### 2. LocationPicker
A modal-based location selector - perfect for form integration.

```tsx
import { LocationPicker } from '@/components/shared/LocationPicker'

<LocationPicker
  value={location}
  onChange={(location) => handleLocationChange(location)}
  label="Event Location"
  placeholder="Select a location for your event"
  required={true}
  description="Click the map to select your event venue"
/>
```

**Props:**
- `value?: LocationValue` - Current selected location
- `onChange: (value: LocationValue) => void` - Callback when location changes
- `label?: string` - Field label (default: "Location")
- `placeholder?: string` - Button placeholder text
- `disabled?: boolean` - Disable the picker
- `required?: boolean` - Mark field as required
- `description?: string` - Help text below the field

### 3. LocationSelector
The original component, now with integrated map support.

```tsx
import { LocationSelector, type LocationValue } from '@/components/shared/location-selector'

<LocationSelector
  value={location}
  onChange={(location) => handleLocationChange(location)}
  defaultMode="map" // 'map' or 'manual'
/>
```

**Props:**
- `value?: LocationValue` - Current selected location
- `onChange: (value: LocationValue) => void` - Callback when location changes
- `defaultMode?: 'manual' | 'map'` - Initial tab (default: 'map')

## LocationValue Interface

```typescript
export interface LocationValue {
  name?: string                    // Venue name
  address?: string               // Full address
  city?: string                  // City name
  country?: string               // Country name
  countryCode?: string           // Country code (e.g., "US")
  place_id?: string              // OpenStreetMap place ID
  location?: {                   // Coordinates
    lat: number
    lng: number
  } | null
}
```

## Usage Examples

### Example 1: In an Event Form

```tsx
import { useState } from 'react'
import { LocationPicker } from '@/components/shared/LocationPicker'

export function EventForm() {
  const [location, setLocation] = useState<LocationValue>()

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Event location:', location)
    // Send to API
  }

  return (
    <form onSubmit={handleSubmit}>
      <LocationPicker
        value={location}
        onChange={setLocation}
        label="Event Venue"
        required={true}
      />
      <button type="submit">Create Event</button>
    </form>
  )
}
```

### Example 2: With Tab Interface

```tsx
import { LocationSelector } from '@/components/shared/location-selector'

export function EventEdit() {
  const [location, setLocation] = useState<LocationValue>(currentEvent.location)

  return (
    <div>
      <h2>Edit Event Location</h2>
      <LocationSelector
        value={location}
        onChange={setLocation}
        defaultMode="map"
      />
    </div>
  )
}
```

### Example 3: Standalone Map

```tsx
import { MapLocationSelector } from '@/components/shared/MapLocationSelector'

export function LocationSearch() {
  const [location, setLocation] = useState<LocationValue>()

  return (
    <div>
      <h3>Find Nearby Events</h3>
      <MapLocationSelector
        value={location}
        onChange={setLocation}
        height="500px"
        zoom={12}
      />
    </div>
  )
}
```

## Integration with EventAddForm

The LocationSelector is already integrated in your EventAddForm component:

```tsx
import { LocationSelector, type LocationValue } from "@/components/shared/location-selector"

// In your form:
<LocationSelector
  value={location}
  onChange={(newLocation) => setLocation(newLocation)}
  defaultMode="map"
/>
```

## Features in Detail

### Search Functionality
- Real-time location search using OpenStreetMap Nominatim API
- Autocomplete suggestions with address details
- Click suggestions to instantly move map and update coordinates
- Debounced search (500ms) to prevent excessive API calls

### Geolocation
- Uses browser's Geolocation API
- Requires HTTPS or localhost
- Shows "Current Location" button for easy access
- Automatically geocodes coordinates to address

### Manual Entry
- Enter venue name, address, city, country
- Input coordinates directly (latitude/longitude)
- Auto-updates other fields based on coordinates

### Marker Management
- Click map to drop marker
- Drag marker to adjust location
- Marker auto-centers on selection
- Visual feedback with popup on click

### Coordinates Display
- Shows coordinates in decimal degrees format
- Copy button to clipboard
- Manual coordinate input
- Precision up to 5 decimal places

## Styling & Customization

All styles are in `/src/styles/map-location-selector.css`

### Custom Height
```tsx
<MapLocationSelector height="600px" />
```

### Custom Center
```tsx
<MapLocationSelector center={{ lat: 40.7128, lng: -74.0060 }} />
```

### Custom Zoom
```tsx
<MapLocationSelector zoom={15} />
```

### CSS Classes
All components use BEM methodology:
- `.map-location-selector` - Main container
- `.map-location-selector__map` - Map container
- `.map-location-selector__search` - Search input
- `.map-location-selector__suggestions` - Dropdown suggestions
- `.map-location-selector__button` - Buttons
- `.map-location-selector__location-display` - Location info box

### Animations
Pre-defined animations for smooth UX:
- `fadeIn` - Smooth fade-in effect
- `slideInUp` - Slide up from bottom
- `slideInDown` - Slide down from top
- `pulse` - Gentle pulsing effect
- `bounce` - Bouncy animation
- `ripple` - Click ripple effect

## API Integration

### OpenStreetMap APIs Used

1. **Search API** (Nominatim)
   - Endpoint: `https://nominatim.openstreetmap.org/search`
   - Limit: 5 suggestions per search
   - Free tier: No API key required

2. **Reverse Geocoding**
   - Endpoint: `https://nominatim.openstreetmap.org/reverse`
   - Converts coordinates to addresses
   - Includes address components parsing

### Map Tiles
- Provider: OpenStreetMap contributors
- Attribution: Automatically included
- No API key required
- Free for all uses

## Performance Optimization

- Debounced search (500ms)
- Memoized map options
- Efficient state management
- Lazy loading of map tiles
- Optimized re-renders

## Accessibility

- Full keyboard navigation support
- ARIA labels on all inputs
- Focus management in dialogs
- High contrast support
- Screen reader friendly

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Map not displaying
1. Check internet connection (tiles are fetched from CDN)
2. Verify browser supports Geolocation API
3. Check browser console for errors

### Search not working
1. Ensure internet connection
2. Check if nominatim.openstreetmap.org is accessible
3. Verify API rate limits haven't been exceeded

### Geolocation not working
1. Requires HTTPS or localhost
2. Check browser permissions
3. Verify GPS/location services enabled on device

## Installation & Setup

Already included in your project! Dependencies:
- `leaflet` - Map rendering
- `react-leaflet` - React integration
- `leaflet-geosearch` - Search functionality
- `@types/leaflet` - TypeScript types

All installed via:
```bash
npm install leaflet react-leaflet leaflet-geosearch @types/leaflet
```

## Migration Guide

### From Google Maps to Leaflet

Old (commented out in location-selector.tsx):
```tsx
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api'
```

New:
```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
```

**Benefits of Leaflet:**
- No API key required
- Lighter bundle size
- Better mobile performance
- OSM is community-driven

## Future Enhancements

Potential features to add:
- Multiple marker support
- Geocoding history
- Saved locations
- Location filtering
- Route drawing
- Radius/polygon selection
- Heatmap visualization
- Real-time collaboration

## Support & Issues

For issues or feature requests related to location selection, check:
1. Browser console for errors
2. Network tab for API calls
3. Component props in source code
4. This documentation

## License

Part of the Eventinos project - all rights reserved.
