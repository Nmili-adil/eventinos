// ============================================
// EXAMPLE: How to use Global Loading in any page
// ============================================

import { useEffect, useState } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

// Example 1: Simple page with data loading
export function ExampleEventsPage() {
  const { setLoading } = useLoading()
  const [events, setEvents] = useState([])
  
  useEffect(() => {
    const loadEvents = async () => {
      // Show loading screen
      setLoading(true, 'Chargement des événements...')
      
      try {
        // Simulate API call
        const response = await fetch('/api/events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        // Always hide loading, even on error
        setLoading(false)
      }
    }
    
    loadEvents()
  }, [setLoading])
  
  return (
    <div>
      <h1>Events</h1>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  )
}

// Example 2: Form submission with loading
export function ExampleCreateEventForm() {
  const { setLoading } = useLoading()
  
  const handleSubmit = async (formData) => {
    setLoading(true, 'Création de l\'événement...')
    
    try {
      await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      alert('Event created!')
    } catch (error) {
      alert('Error creating event')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">Create Event</button>
    </form>
  )
}

// Example 3: Multiple API calls
export function ExampleDashboard() {
  const { setLoading } = useLoading()
  
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true, 'Chargement du tableau de bord...')
      
      try {
        const [users, events, stats] = await Promise.all([
          fetch('/api/users').then(r => r.json()),
          fetch('/api/events').then(r => r.json()),
          fetch('/api/stats').then(r => r.json())
        ])
        
        // Use the data...
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboard()
  }, [setLoading])
  
  return <div>Dashboard</div>
}

// Example 4: Button action with loading
export function ExampleDeleteButton({ eventId }) {
  const { setLoading } = useLoading()
  
  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return
    
    setLoading(true, 'Suppression en cours...')
    
    try {
      await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      alert('Deleted!')
    } finally {
      setLoading(false)
    }
  }
  
  return <button onClick={handleDelete}>Delete</button>
}

// ============================================
// HOW TO USE IN YOUR EXISTING PAGES:
// ============================================

/*
1. Import the hook:
   import { useLoading } from '@/contexts/LoadingContext'

2. Get the setLoading function:
   const { setLoading } = useLoading()

3. Use it in your async operations:
   
   setLoading(true, 'Your message...')  // Show loading
   // ... do your work ...
   setLoading(false)                     // Hide loading

4. Always use try/finally to ensure loading stops:
   
   try {
     setLoading(true, 'Loading...')
     await doSomething()
   } finally {
     setLoading(false)
   }
*/
