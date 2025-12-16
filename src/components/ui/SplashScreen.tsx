import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'

interface SplashScreenProps {
  onLoadingComplete?: () => void
  minDisplayTime?: number
}

export default function SplashScreen({ 
  onLoadingComplete, 
  minDisplayTime = 1500 
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, minDisplayTime / 10)

    // Call onLoadingComplete after minDisplayTime
    const timeout = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete()
      }
    }, minDisplayTime)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [minDisplayTime, onLoadingComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-2xl">
            <Calendar className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Eventinos
          </h1>
          <p className="text-gray-600 mt-2 text-sm">Gestion d'événements</p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-sm text-gray-500 animate-pulse">
          Chargement en cours...
        </p>
      </div>
    </div>
  )
}
