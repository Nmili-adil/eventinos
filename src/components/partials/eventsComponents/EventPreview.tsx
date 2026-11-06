import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/store/app/store'
import type { RootState } from '@/store/app/rootReducer'
import { fetchAllSponsorCategoriesRequest } from '@/store/features/sponsorCategories/sponsorCategories.actions'
import { getSpeakerName, getSpeakerRole, groupPartnersByType } from '@/lib/event-people'
import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Users, Globe, Lock } from 'lucide-react'
import type { EventFormData } from '@/schema/eventSchema'
import { format } from 'date-fns'
import { GoogleMapWrapper, SingleMarkerMap } from '@/components/shared/GoogleMap'
import { getStatusColor } from '@/lib/events-utils'
import { getEventStatusLabelKey } from '@/constants/eventStatuses'
import { useTranslation } from 'react-i18next'

interface EventPreviewProps {
  formData: EventFormData
} 

export const EventPreview: React.FC<EventPreviewProps> = ({ formData }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const partnerTypes = useSelector((state: RootState) => state.sponsorCategories.all)
  const hasPartners = (formData.sponsors?.length ?? 0) > 0

  useEffect(() => {
    if (hasPartners) dispatch(fetchAllSponsorCategoriesRequest())
  }, [hasPartners, dispatch])

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
    <div className="w-full flex justify-center  p-4 bg-gray-100">
      <DeviceFrameset device="Galaxy Note 8" color="white" zoom={0.90} width={350} height={670} >
        {/* Content */}
        <div className="bg-white w-full h-full overflow-y-auto" style={{ minHeight: '670px', maxHeight: '812px', scrollbarWidth: 'none' }}>
            {/* Event Image */}
            <div className="relative w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500">
              {((typeof formData.image === "object" && (formData.image as any)?.data?.path) || (typeof formData.image === "object" && (formData.image as any)?.url) || formData.image) ? (
                <img
                  src={(typeof formData.image === "object" && (formData.image as any)?.data?.path) || (typeof formData.image === "object" && (formData.image as any)?.url) || formData.image || ''}
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
              <div className="absolute top-7 right-4">
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
                {formData.organizer?.name && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t('events.details.organizedBy', 'Organized by')} {formData.organizer.name}
                  </p>
                )}
                {formData.status && (
                  <Badge
                    variant="outline"
                    className={`mt-2 ${getStatusColor(formData.status)}`}
                  >
                    {t(getEventStatusLabelKey(formData.status) ?? formData.status)}
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

              {/* Map Preview */}
              {formData.location?.location?.lat && formData.location?.location?.lng && (
                <div className="rounded-lg border">
                  <GoogleMapWrapper>
                    <SingleMarkerMap
                      location={{
                        lat: Number(formData.location.location.lat),
                        lng: Number(formData.location.location.lng),
                      }}
                      name={formData.location.name}
                      address={[formData.location.city, formData.location.country].filter(Boolean).join(', ')}
                      height="180px"
                      showControls={false}
                    />
                  </GoogleMapWrapper>
                </div>
              )}

              {/* Speakers Preview */}
              {formData.speakers && formData.speakers.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    {t('eventForm.fields.speakers')} ({formData.speakers.length})
                  </p>
                  <div className="space-y-2">
                    {formData.speakers.map((speaker, idx) => (
                      <div key={speaker._id || idx} className="flex items-center gap-2">
                        {speaker.picture && (
                          <img src={speaker.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <div className="min-w-0 text-xs">
                          <p className="font-medium text-gray-900 truncate">{getSpeakerName(speaker)}</p>
                          <p className="text-gray-500 truncate">{getSpeakerRole(speaker)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partners Preview */}
              {formData.sponsors && formData.sponsors.length > 0 && (
                <div className="space-y-2">
                  {groupPartnersByType(t, formData.sponsors, partnerTypes).map((group) => (
                    <div key={group.id || 'other'}>
                      <p className="text-xs font-medium text-gray-700 mb-1">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.partners.map((partner, idx) => (
                          <div key={partner._id || idx} className="flex items-center gap-1 text-xs text-gray-600">
                            {partner.logo && (
                              <img src={partner.logo} alt="" className="w-6 h-6 rounded object-cover" />
                            )}
                            <span>{partner.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

