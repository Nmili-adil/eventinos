# Global Loading Context - Usage Guide

The global loading system allows you to show a full-screen loading indicator from **any page or component** in your application.

## Setup (Already Done ✅)

The `LoadingProvider` is already wrapped around your entire app in `src/app/index.tsx`:

```tsx
<Provider store={store}>
  <LoadingProvider>
    <Toaster position="bottom-right" />
    <RouterProvider router={Router} />
  </LoadingProvider>
</Provider>
```

## How to Use in Any Page/Component

### 1. Import the Hook
```tsx
import { useLoading } from '@/contexts/LoadingContext'
```

### 2. Use in Your Component
```tsx
function MyPage() {
  const { setLoading } = useLoading()
  
  useEffect(() => {
    const fetchData = async () => {
      // Show loading screen
      setLoading(true, 'Chargement des données...')
      
      try {
        // Your API calls here
        await fetchSomeData()
        
        // Hide loading screen when done
        setLoading(false)
      } catch (error) {
        // Always hide loading on error too
        setLoading(false)
      }
    }
    
    fetchData()
  }, [setLoading])
  
  return <div>Your content</div>
}
```

## Complete Examples

### Example 1: Simple Page Load
```tsx
import { useEffect } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

function EventsPage() {
  const { setLoading } = useLoading()
  const [events, setEvents] = useState([])
  
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true, 'Chargement des événements...')
      
      try {
        const response = await fetchEvents()
        setEvents(response.data)
      } finally {
        setLoading(false)
      }
    }
    
    loadEvents()
  }, [setLoading])
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

### Example 2: Form Submission
```tsx
import { useLoading } from '@/contexts/LoadingContext'

function CreateEventForm() {
  const { setLoading } = useLoading()
  
  const handleSubmit = async (data) => {
    setLoading(true, 'Création de l\'événement...')
    
    try {
      await createEvent(data)
      toast.success('Événement créé!')
    } catch (error) {
      toast.error('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Example 3: Multiple API Calls
```tsx
import { useLoading } from '@/contexts/LoadingContext'

function DashboardPage() {
  const { setLoading } = useLoading()
  
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true, 'Chargement du tableau de bord...')
      
      try {
        // Load multiple things
        const [users, events, stats] = await Promise.all([
          fetchUsers(),
          fetchEvents(),
          fetchStats()
        ])
        
        // Process data...
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboard()
  }, [setLoading])
  
  return <div>Dashboard content</div>
}
```

### Example 4: With Custom Loading Messages
```tsx
import { useLoading } from '@/contexts/LoadingContext'

function DataImportPage() {
  const { setLoading } = useLoading()
  
  const handleImport = async (file) => {
    // Step 1
    setLoading(true, 'Téléchargement du fichier...')
    await uploadFile(file)
    
    // Step 2
    setLoading(true, 'Traitement des données...')
    await processData()
    
    // Step 3
    setLoading(true, 'Finalisation...')
    await finalizeImport()
    
    // Done
    setLoading(false)
  }
  
  return <button onClick={handleImport}>Import</button>
}
```

### Example 5: Route Change Loading
```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLoading } from '@/contexts/LoadingContext'

function RouteLoadingWrapper({ children }) {
  const { setLoading } = useLoading()
  const location = useLocation()
  
  useEffect(() => {
    // Show loading on route change
    setLoading(true, 'Chargement de la page...')
    
    // Hide after a short delay (or when data loads)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [location.pathname, setLoading])
  
  return children
}
```

## API Reference

### `useLoading()` Hook

Returns an object with:

```tsx
{
  isLoading: boolean,           // Current loading state
  setLoading: (loading: boolean, text?: string) => void,  // Control loading
  loadingText: string           // Current loading message
}
```

### `setLoading(loading, text?)`

**Parameters:**
- `loading` (boolean): `true` to show loading, `false` to hide
- `text` (string, optional): Custom loading message

**Examples:**
```tsx
setLoading(true)                              // Show with default text
setLoading(true, 'Loading...')                // Show with custom text
setLoading(true, 'Chargement des données...') // French text
setLoading(false)                             // Hide loading
```

## Best Practices

1. ✅ **Always hide loading in finally block** - Ensures loading stops even on errors
2. ✅ **Use descriptive messages** - Tell users what's happening
3. ✅ **Keep loading times reasonable** - Don't show for very quick operations (<200ms)
4. ✅ **Handle errors gracefully** - Always call `setLoading(false)` in error cases
5. ✅ **Don't nest loading calls** - One loading screen at a time
6. ✅ **Update text for multi-step operations** - Keep users informed

## Common Patterns

### Pattern 1: Async Function Wrapper
```tsx
const withLoading = async (fn, message) => {
  setLoading(true, message)
  try {
    return await fn()
  } finally {
    setLoading(false)
  }
}

// Usage
await withLoading(() => fetchData(), 'Loading data...')
```

### Pattern 2: Custom Hook
```tsx
function useLoadingAction() {
  const { setLoading } = useLoading()
  
  const executeWithLoading = async (action, message) => {
    setLoading(true, message)
    try {
      return await action()
    } finally {
      setLoading(false)
    }
  }
  
  return executeWithLoading
}

// Usage in component
const execute = useLoadingAction()
await execute(() => saveData(), 'Saving...')
```

## Troubleshooting

**Q: Loading screen doesn't appear**
- Make sure `LoadingProvider` wraps your app
- Check that you're calling `setLoading(true)`
- Verify no errors in console

**Q: Loading screen doesn't disappear**
- Ensure you call `setLoading(false)` in all code paths
- Use `finally` block to guarantee cleanup
- Check for unhandled promise rejections

**Q: Multiple loading screens overlap**
- The global loader shows only one at a time
- Last call to `setLoading(true)` wins
- Coordinate loading states in parent components
