# Global Error Handling Setup - Complete Guide

## Overview
The application now has comprehensive error handling for 500 server errors and other runtime errors, providing a great user experience when things go wrong.

## Components Created

### 1. **ServerErrorPage** (`src/pages/ServerErrorPage.tsx`)
A beautiful, user-friendly 500 error page with:
- Animated gradient background
- Clear error messaging
- Three action buttons: Try Again, Go to Dashboard, Go Back
- Development mode error details (hidden in production)
- Responsive design

### 2. **ErrorBoundary** (Enhanced `src/components/shared/ErrorBoundary.tsx`)
- Catches JavaScript errors anywhere in the component tree
- Automatically displays ServerErrorPage for caught errors
- Integrated with React Router for route-level errors
- Detects 500 errors specifically and displays appropriate UI

### 3. **Global Error Handler Hook** (`src/hooks/useGlobalErrorHandler.ts`)
A custom React hook for handling errors globally with options for:
- Toast notifications
- Custom error handlers
- Automatic redirects
- Server error detection

### 4. **API Client Enhancement** (`src/lib/apiClient.ts`)
Axios interceptor that:
- Automatically detects 500+ status codes
- Flags errors as server errors
- Logs detailed error information
- Passes enhanced error objects to error handlers

## Usage Examples

### Basic Usage - Already Integrated ✅

The error handling is already set up globally in your app:

```tsx
// src/app/index.tsx (Already done)
<Provider store={store}>
  <Toaster position="bottom-right" />
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
</Provider>
```

### Using in Individual Components

#### Example 1: Handling Async Operations with Toast

```tsx
import { handleAsyncError } from '@/hooks/useGlobalErrorHandler'

const MyComponent = () => {
  const handleSubmit = async () => {
    try {
      await someApiCall()
      toast.success('Success!')
    } catch (error) {
      // Automatically shows appropriate toast for server errors
      handleAsyncError(error, 'Failed to submit the form')
    }
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

#### Example 2: Custom Error Handling

```tsx
import { useGlobalErrorHandler, isServerError } from '@/hooks/useGlobalErrorHandler'

const MyPage = () => {
  useGlobalErrorHandler({
    showToast: true,
    onServerError: (error) => {
      console.log('Custom server error handling:', error)
      // Send to analytics, logging service, etc.
    }
  })

  return <div>My Page Content</div>
}
```

#### Example 3: Checking for Server Errors

```tsx
import { isServerError } from '@/hooks/useGlobalErrorHandler'

const MyComponent = () => {
  const handleError = (error: any) => {
    if (isServerError(error)) {
      // Handle server error differently
      console.log('This is a server error')
    } else {
      // Handle client error
      console.log('This is a client error')
    }
  }
}
```

#### Example 4: Protected Route with Error Boundary

```tsx
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

// Wrap specific routes with their own error boundary
const MyRoute = () => {
  return (
    <ErrorBoundary
      onReset={() => {
        console.log('Error boundary reset')
        // Custom reset logic
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  )
}
```

## Testing the Error Handling

### Test 500 Errors in Your API Calls

```tsx
// In any component
import { api } from '@/lib/apiClient'

const TestComponent = () => {
  const triggerServerError = async () => {
    try {
      // This will trigger the 500 error handling
      await api.get('/some-endpoint-that-returns-500')
    } catch (error) {
      console.log('Error caught:', error)
      // The error will be automatically handled by the interceptor
      // and the ServerErrorPage will be shown if it's a 500 error
    }
  }

  return <button onClick={triggerServerError}>Test 500 Error</button>
}
```

### Test Component Error Boundary

```tsx
// Create a component that throws an error
const BrokenComponent = () => {
  throw new Error('Test error boundary')
  return <div>This won't render</div>
}

// Wrap it in ErrorBoundary
const TestPage = () => {
  return (
    <ErrorBoundary>
      <BrokenComponent />
    </ErrorBoundary>
  )
}
```

## Features

### Automatic Detection
- ✅ All 500+ HTTP status codes are automatically caught
- ✅ API errors are intercepted globally
- ✅ Component errors are caught by ErrorBoundary
- ✅ Route errors display appropriate error pages

### User Experience
- ✅ Beautiful, responsive error pages
- ✅ Clear, friendly error messages
- ✅ Multiple recovery options (Try Again, Go Home, Go Back)
- ✅ Loading states during recovery
- ✅ Toast notifications for non-critical errors

### Developer Experience
- ✅ Detailed error logs in development
- ✅ Error stack traces visible in dev mode
- ✅ Easy to customize error handling per component
- ✅ TypeScript support
- ✅ Reusable hooks and utilities

## Customization

### Custom Error Page
You can create a custom error page and pass it as a fallback:

```tsx
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const MyCustomErrorPage = () => (
  <div>Custom error UI</div>
)

<ErrorBoundary fallback={<MyCustomErrorPage />}>
  <MyComponent />
</ErrorBoundary>
```

### Custom Server Error Page Styling
Edit `src/pages/ServerErrorPage.tsx` to match your brand:
- Change color gradients
- Modify animations
- Update messaging
- Add your logo

## Error Logging Integration

To integrate with error logging services (Sentry, LogRocket, etc.):

```tsx
// In src/components/shared/ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('Error Boundary caught an error:', error, errorInfo)
  
  // Add your error logging service here
  // Example: Sentry.captureException(error, { extra: errorInfo })
}
```

## Best Practices

1. **Always use try-catch for async operations**
   ```tsx
   try {
     await api.post('/endpoint', data)
   } catch (error) {
     handleAsyncError(error)
   }
   ```

2. **Let the system handle 500 errors automatically**
   - Don't create custom 500 error handling for each API call
   - The interceptor will catch them all

3. **Use ErrorBoundary for critical sections**
   ```tsx
   <ErrorBoundary>
     <CriticalFeature />
   </ErrorBoundary>
   ```

4. **Provide meaningful error messages**
   ```tsx
   handleAsyncError(error, 'Failed to save your event. Please try again.')
   ```

## Files Modified/Created

- ✅ Created: `src/pages/ServerErrorPage.tsx`
- ✅ Enhanced: `src/components/shared/ErrorBoundary.tsx`
- ✅ Created: `src/hooks/useGlobalErrorHandler.ts`
- ✅ Enhanced: `src/lib/apiClient.ts`
- ✅ Already integrated in: `src/app/index.tsx`
- ✅ Already integrated in: `src/router/router.tsx`

## Summary

Your app now has enterprise-grade error handling that:
- Catches all 500 server errors automatically
- Displays beautiful, user-friendly error pages
- Provides multiple recovery options
- Shows detailed debugging info in development
- Works seamlessly with your existing code
- Requires no changes to existing components (works automatically!)
