import { Loader2 } from 'lucide-react'

interface PageLoaderProps {
  text?: string
  fullHeight?: boolean
}

export default function PageLoader({ 
  text = 'Chargement des données...', 
  fullHeight = true 
}: PageLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullHeight ? 'min-h-screen' : 'min-h-[400px]'}`}>
      <div className="relative">
        {/* Animated background blur */}
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        
        {/* Spinner */}
        <Loader2 className="relative h-12 w-12 animate-spin text-blue-600" />
      </div>
      
      {text && (
        <div className="text-center">
          <p className="text-gray-600 font-medium">{text}</p>
          <p className="text-sm text-gray-400 mt-1">Veuillez patienter...</p>
        </div>
      )}
    </div>
  )
}
