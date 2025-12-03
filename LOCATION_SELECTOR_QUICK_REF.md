# 🎯 Quick Reference: Location Selector

## Current Implementation

✅ **Using Google Maps** (already configured)  
✅ **Integrated in EventAddForm**  
✅ **Integrated in EventEditForm**  
✅ **No additional setup required**  

## Features Available

🗺️ Interactive map with click-to-select  
🔍 Google Places search  
📍 Geolocation support  
🎯 Draggable markers  
📋 Copy coordinates  
⚡ Manual entry mode  

## How Users Interact

### Mode 1: Interactive Map (Default)
1. Click "Interactive Map" tab
2. Search for location OR click map OR use "Current Location"
3. Adjust by dragging marker if needed
4. Location details auto-populate

### Mode 2: Manual Entry
1. Click "Manual Entry" tab
2. Fill in venue name, address, city, country
3. Enter coordinates if known
4. All fields are optional

## Data Returned

```typescript
{
  name: "Venue Name",
  address: "Full Address",
  city: "City",
  country: "Country",
  countryCode: "MA",
  place_id: "Google Place ID",
  location: {
    lat: 33.5731,
    lng: -7.5898
  }
}
```

## Files Modified

- ✅ `/src/components/shared/MapLocationSelector.tsx` - New map component
- ✅ `/src/components/shared/location-selector.tsx` - Updated with Google Maps
- ✅ `/src/styles/map-location-selector.css` - Styles
- ✅ `/src/index.css` - Imported styles

## Test It

1. Start dev server: `npm run dev`
2. Go to "Create Event" page
3. Navigate to Location section
4. Try both Interactive Map and Manual Entry modes
5. Search for a location
6. Click the map to drop a pin
7. Use "Current Location" button
8. Drag the marker around

## Troubleshooting

**Map not showing?**
→ Check `VITE_GOOGLE_MAPS_API_KEY` in `.env`

**Search not working?**
→ Verify Google Places API is enabled

**Geolocation fails?**
→ Use HTTPS or localhost, allow browser permissions

That's it! The feature is ready to use. 🚀
