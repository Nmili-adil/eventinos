import React, { useEffect, useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Cake,
  Shield,
  Users,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import type { Member } from "@/types/membersType"
import { useTranslation } from "react-i18next"
import { fetchMemberParticipationsApi } from "@/api/guestsApi"

interface MemberDetailsDialogProps {
  member: Member | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (member: Member) => void
  onDelete?: (member: Member) => void
}



const MemberDetailsDialog = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemberDetailsDialogProps) => {
  const { t } = useTranslation()

  // Enhanced safe render helper
  const safeRender = (value: any, fallback: string = t('members.detailsDialog.notAvailable')): string => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (typeof value === 'object') {
      if (React.isValidElement(value)) return fallback
      if (typeof value.toString === 'function' && value.toString() !== '[object Object]') {
        return value.toString()
      }
      if (value.city || value.country || value.name) {
        return [value.city, value.country, value.name].filter(Boolean).join(', ')
      }
      return fallback
    }
    return fallback
  }

  const [memberEvents, setMemberEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'activity'>('overview')

  // Close dialog on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const formatDate = (dateInput: any): string => {
    try {
      if (!dateInput) return t('members.detailsDialog.notAvailable', 'Not available')
      
      let timestamp: number
      
      if (typeof dateInput === 'string') {
        if (/^\d+$/.test(dateInput)) {
          timestamp = parseInt(dateInput, 10)
        } else {
          const parsed = Date.parse(dateInput)
          if (Number.isNaN(parsed)) return t('members.detailsDialog.notAvailable', 'Not available')
          timestamp = parsed
        }
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        timestamp = parseInt(dateInput.$date.$numberLong)
      } else if (dateInput.$numberLong) {
        timestamp = parseInt(dateInput.$numberLong)
      } else if (dateInput instanceof Date) {
        timestamp = dateInput.getTime()
      } else if (typeof dateInput === 'number') {
        timestamp = dateInput
      } else {
        return t('members.detailsDialog.notAvailable', 'Not available')
      }
      
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return t('members.detailsDialog.notAvailable', 'Not available')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getMemberId = (member: Member): string => {
    if (!member?._id) return 'N/A'
    if (typeof member._id === 'string') return member._id.slice(-8)
    if (member._id.$oid) return member._id.$oid.slice(-8)
    return 'N/A'
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRegistrationColor = (isCompleted: boolean) => {
    return isCompleted
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-amber-100 text-amber-800 border-amber-200'
  }

  const handleEdit = () => {
    if (member) onEdit?.(member)
    onClose()
  }

  const handleDelete = () => {
    if (member) onDelete?.(member)
  }

  useEffect(() => {
    const loadMemberEvents = async () => {
      if (!member?._id) return
      
      const memberId = typeof member._id === 'string' ? member._id : member._id.$oid
      if (!memberId) return
      
      setEventsLoading(true)
      setEventsError(null)
      try {
        const response = await fetchMemberParticipationsApi(memberId)
        const data = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : []
        setMemberEvents(data)
      } catch (error: any) {
        console.error('Failed to load member events', error)
        setMemberEvents([])
        setEventsError(error?.response?.data?.message || error?.message || t('members.detailsDialog.events.unableToLoad'))
      } finally {
        setEventsLoading(false)
      }
    }

    if (member && isOpen) {
      loadMemberEvents()
      setActiveTab('overview')
    }
  }, [member, isOpen, t])

  if (!member || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden transform transition-transform duration-300 scale-100 border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                {member.picture ? (
                  <img 
                    src={member.picture} 
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {getInitials(member.firstName, member.lastName)}
                  </span>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                member.isActive ? 'bg-emerald-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {safeRender(member.firstName)} {safeRender(member.lastName)}
              </h2>
              <p className="text-gray-600 flex items-center space-x-2 mt-1">
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  ID: {getMemberId(member)}
                </span>
                <span className="text-sm">{safeRender(member.email)}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-700  rounded-xl transition-colors duration-200 group border-red-600 border cursor-pointer"
            >
              <X className="w-5 h-5 text-red-600 group-hover:text-gray-100" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex space-x-1 px-6">
            {[
              { id: 'overview', label: t('members.detailsDialog.tabs.overview'), icon: User },
              { id: 'events', label: t('members.detailsDialog.tabs.events'), icon: Users, count: memberEvents.length },
              { id: 'activity', label: t('members.detailsDialog.tabs.activity'), icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-300px)]">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`border-2 rounded-xl px-4 py-2 ${getStatusColor(member.isActive ?? false)}`}>
                  <div className="flex items-center justify-between py-0">
                    <div className="py-0">
                      <p className="text-xs font-medium">{t('members.detailsDialog.labels.accountStatus')}</p>
                      <p className="text-sm font-semibold mt-1">
                        {member.isActive ? t('members.detailsDialog.status.active') : t('members.detailsDialog.status.inactive')}
                      </p>
                    </div>
                    {member.isActive ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <UserX className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </div>
                
                <div className={`border-2 rounded-xl px-4 py-2 ${getRegistrationColor(member.registrationCompleted ?? false)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{t('members.detailsDialog.labels.registration')}</p>
                      <p className="text-sm font-semibold mt-1">
                        {member.registrationCompleted ? t('members.detailsDialog.status.registrationComplete') : t('members.detailsDialog.status.registrationPending')}
                      </p>
                    </div>
                    {member.registrationCompleted ? (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  {t('members.detailsDialog.sections.contactInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">{t('members.detailsDialog.labels.emailAddress')}</label>
                    <div className="flex items-center mt-1 space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{safeRender(member.email, t('members.detailsDialog.labels.notProvided'))}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">{t('members.detailsDialog.labels.phoneNumber')}</label>
                    <div className="flex items-center mt-1 space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{safeRender(member.phoneNumber, t('members.detailsDialog.labels.notProvided'))}</p>
                    </div>
                  </div>
                  {(member.city || member.country) && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600 font-medium">{t('members.detailsDialog.labels.location')}</label>
                      <div className="flex items-center mt-1 space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">
                          {[safeRender(member.city), safeRender(member.country)].filter(Boolean).join(', ') || t('members.detailsDialog.labels.notProvided')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  {t('members.detailsDialog.sections.personalInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">{t('members.detailsDialog.labels.firstName')}</label>
                    <p className="text-gray-900 mt-1">{safeRender(member.firstName)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">{t('members.detailsDialog.labels.lastName')}</label>
                    <p className="text-gray-900 mt-1">{safeRender(member.lastName)}</p>
                  </div>
                  {member.gender && (
                    <div>
                      <label className="text-sm text-gray-600 font-medium">{t('members.detailsDialog.labels.gender')}</label>
                      <p className="text-gray-900 mt-1 capitalize">{safeRender(member.gender)}</p>
                    </div>
                  )}
                  {member.birthday && (
                    <div>
                      <label className="text-sm text-gray-600 font-medium">{t('members.detailsDialog.labels.birthday')}</label>
                      <div className="flex items-center mt-1 space-x-2">
                        <Cake className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{formatDate(member.birthday)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Timeline */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                  {t('members.detailsDialog.sections.accountInfo')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{t('members.detailsDialog.labels.memberSince')}</span>
                    <span className="font-medium text-gray-900">{formatDate(member.createdAt)}</span>
                  </div>
                  {member.updatedAt && (
                    <div className="flex justify-between items-center py-2 border-t border-gray-200">
                      <span className="text-gray-600">{t('members.detailsDialog.labels.lastUpdated')}</span>
                      <span className="font-medium text-gray-900">{formatDate(member.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  {t('members.detailsDialog.labels.eventParticipation')}
                </h3>
                
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">{t('members.detailsDialog.events.loadingEvents')}</span>
                  </div>
                ) : eventsError ? (
                  <div className="flex items-center justify-center py-8 text-red-600 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{eventsError}</span>
                  </div>
                ) : memberEvents.length > 0 ? (
                  <div className="space-y-3">
                    {memberEvents.map((eventRecord: any, index: number) => (
                      <div
                        key={eventRecord?._id || eventRecord?.eventId || index}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {safeRender(eventRecord?.eventName || eventRecord?.name, t('members.detailsDialog.events.untitledEvent'))}
                            </h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{eventRecord?.date ? formatDate(eventRecord.date) : t('members.detailsDialog.events.dateNotSet')}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{safeRender(eventRecord?.city || eventRecord?.location, t('members.detailsDialog.events.locationNotSet'))}</span>
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            eventRecord?.status === 'confirmed' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : eventRecord?.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {safeRender(eventRecord?.status, t('members.detailsDialog.events.registered'))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t('members.detailsDialog.events.noEvents')}</p>
                    <p className="text-sm mt-1">{t('members.detailsDialog.events.noEventsDescription')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  {t('members.detailsDialog.labels.accountActivity')}
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('members.detailsDialog.labels.accountCreated')}</span>
                      <span className="font-medium text-gray-900">{formatDate(member.createdAt)}</span>
                    </div>
                  </div>
                  {member.updatedAt && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('members.detailsDialog.labels.lastProfileUpdate')}</span>
                        <span className="font-medium text-gray-900">{formatDate(member.updatedAt)}</span>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('members.detailsDialog.labels.eventParticipations')}</span>
                      <span className="font-medium text-gray-900">{t('members.detailsDialog.events.eventsCount', { count: memberEvents.length })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 bg-gray-50 px-6  h-[80px] overflow-hidden">
          <div className="flex justify-between items-center h-full mb-5 overflow-hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-100 font-medium transition-colors duration-200 border border-slate-400 rounded-md shadow-sm hover:bg-gray-700 cursor-pointer overflow-hidden"
            >
              {t('members.detailsDialog.buttons.close')}
            </button>
            
            <div className="flex space-x-3 overflow-hidden">
              {/* {onEdit && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Member</span>
                </button>
              )} */}
              {/* {onDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Member</span>
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberDetailsDialog