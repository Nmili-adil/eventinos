# Loading Components Usage Guide

This project includes three loading components for different use cases:

## 1. LoadingSpinner
A simple, reusable spinner component for inline loading states.

### Usage:
```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Small spinner
<LoadingSpinner size="sm" text="Loading..." />

// Medium spinner (default)
<LoadingSpinner size="md" text="Please wait..." />

// Large spinner
<LoadingSpinner size="lg" text="Loading data..." />

// Full screen overlay
<LoadingSpinner size="xl" text="Processing..." fullScreen />
```

### Props:
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: string (default: 'Chargement...')
- `fullScreen`: boolean (default: false)

---

## 2. PageLoader
A page-level loading component with animated background, ideal for loading entire pages or sections.

### Usage:
```tsx
import PageLoader from '@/components/ui/PageLoader'

// Full height (covers entire viewport)
<PageLoader text="Chargement des statistiques" />

// Partial height (400px minimum)
<PageLoader text="Loading content..." fullHeight={false} />

// In a component
function MyPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  if (isLoading) {
    return <PageLoader text="Loading page data..." />
  }
  
  return <div>Your content here</div>
}
```

### Props:
- `text`: string (default: 'Chargement des données...')
- `fullHeight`: boolean (default: true)

---

## 3. SplashScreen
A full-screen splash screen with progress bar, perfect for app initialization.

### Usage:
```tsx
import { useState, useEffect } from 'react'
import SplashScreen from '@/components/ui/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  
  return (
    <>
      {showSplash && (
        <SplashScreen 
          onLoadingComplete={() => setShowSplash(false)}
          minDisplayTime={2000}
        />
      )}
      {!showSplash && <YourMainApp />}
    </>
  )
}
```

### Props:
- `onLoadingComplete`: () => void (callback when loading completes)
- `minDisplayTime`: number (milliseconds, default: 1500)

---

## Examples in Context

### Example 1: Overview Page (Already Implemented)
```tsx
import PageLoader from '@/components/ui/PageLoader'

function Overviewpage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  useEffect(() => {
    // Fetch data...
    fetchData().finally(() => setIsInitialLoading(false))
  }, [])
  
  if (isInitialLoading) {
    return <PageLoader text="Chargement des statistiques" />
  }
  
  return <div>Your page content</div>
}
```

### Example 2: Button Loading State
```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner'

function SubmitButton() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  return (
    <button disabled={isSubmitting}>
      {isSubmitting ? (
        <LoadingSpinner size="sm" text="" />
      ) : (
        'Submit'
      )}
    </button>
  )
}
```

### Example 3: App Initialization
```tsx
import { useState, useEffect } from 'react'
import SplashScreen from '@/components/ui/SplashScreen'

function App() {
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    // Initialize app (load config, check auth, etc.)
    initializeApp().then(() => {
      // SplashScreen will handle the timing
    })
  }, [])
  
  if (!isInitialized) {
    return (
      <SplashScreen 
        onLoadingComplete={() => setIsInitialized(true)}
        minDisplayTime={2000}
      />
    )
  }
  
  return <MainApp />
}
```

---

## Best Practices

1. **Use PageLoader for page-level loading** - When loading an entire page or major section
2. **Use LoadingSpinner for inline loading** - Buttons, cards, small sections
3. **Use SplashScreen for app initialization** - First load, authentication check, etc.
4. **Always provide meaningful text** - Help users understand what's loading
5. **Set minimum display times** - Avoid flashing loaders (at least 500ms)
6. **Handle errors gracefully** - Show error states instead of infinite loading

---

## Customization

All components use Tailwind CSS and can be customized by:
1. Modifying the component files directly
2. Passing custom className props (if added)
3. Adjusting colors in your Tailwind config
