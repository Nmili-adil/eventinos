import React from 'react'
import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Users, Globe, Lock } from 'lucide-react'
import type { EventFormData } from '@/schema/eventSchema'
import { format } from 'date-fns'

interface EventPreviewProps {
  formData: EventFormData
}

export const EventPreview: React.FC<EventPreviewProps> = ({ formData }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    try {
      const date = new Date(dateString)
      return format(date, 'MMM dd, yyyy')
    } catch {
      return 'Not set'
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Not set'
    try {
      const date = new Date(dateString)
      return format(date, 'HH:mm')
    } catch {
      return 'Not set'
    }
  }

  return (
    <div className="w-full flex justify-center">
      <DeviceFrameset device="iPhone X" color="white" zoom={0.75} width={375} height={812}>
        {/* Content */}
        <div className="bg-white w-full h-full overflow-y-auto" style={{ minHeight: '812px', maxHeight: '812px' }}>
            {/* Event Image */}
            <div className="relative w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500">
              {(formData.image?.data?.path || formData.image?.url || formData.image) ? (
                <img
                  src={formData.image?.data?.path || formData.image?.url || formData.image || ''}
                  alt={formData.name || 'Event'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'E'}
                </div>
              )}
              <div className="absolute top-5 right-4">
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-gray-900 backdrop-blur-sm text-xs"
                >
                  {formData.visibility === 'PUBLIC' ? (
                    <Globe className="w-3 h-3 mr-1" />
                  ) : (
                    <Lock className="w-3 h-3 mr-1" />
                  )}
                  {formData.visibility || 'PUBLIC'}
                </Badge>
              </div>
            </div>

            {/* Event Details */}
            <CardContent className="p-4 space-y-4">
              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                  {formData.name || 'Event Name'}
                </h2>
                {formData.status && (
                  <Badge
                    variant="outline"
                    className={`mt-2 ${
                      formData.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : formData.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : formData.status === 'REFUSED'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {formData.status}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {formData.description && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {formData.description}
                </p>
              )}

              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Start:</span>
                  <span>{formatDate(formData.startDate?.date || '')}</span>
                  <Clock className="w-4 h-4 text-blue-600 ml-2" />
                  <span>{formatTime(formData.startDate?.date || '')}</span>
                </div>
                {formData.endDate?.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">End:</span>
                    <span>{formatDate(formData.endDate.date)}</span>
                    <Clock className="w-4 h-4 text-purple-600 ml-2" />
                    <span>{formatTime(formData.endDate.date)}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {formData.location?.name && (
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{formData.location.name}</p>
                    {(formData.location.city || formData.location.country) && (
                      <p className="text-xs text-gray-500">
                        {[formData.location.city, formData.location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Type & Capacity */}
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="text-xs">
                  {formData.type === 'FACETOFACE' ? 'Face to Face' : formData.type === 'VIRTUEL' ? 'Virtual' : formData.type || 'N/A'}
                </Badge>
                {formData.capacity > 0 && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{formData.capacity} capacity</span>
                  </div>
                )}
              </div>

              {/* Gallery Preview */}
              {formData.gallery && formData.gallery.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Gallery ({formData.gallery.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.gallery.slice(0, 3).map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-200"
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                    {formData.gallery.length > 3 && (
                      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        +{formData.gallery.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Badges Preview */}
              {formData.badges && formData.badges.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Available Badges ({formData.badges.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.badges.slice(0, 3).map((_, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        Badge {idx + 1}
                      </Badge>
                    ))}
                    {formData.badges.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{formData.badges.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
        </div>
      </DeviceFrameset>
    </div>
  )
}

