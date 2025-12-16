import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook that scrolls to top (0, 0) whenever the route changes
 * Usage: Simply call useScrollToTop() in your layout or router component
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}

/**
 * Helper function to manually scroll to top
 * Usage: Call scrollToTop() when needed (e.g., after form submission, data load, etc.)
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  })
}
