import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/app/rootReducer';
import { toast } from 'sonner';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Icons
import {
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  UserX,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Check,
  X,
  CheckIcon,
  XIcon,
  Search,
  Grid3x3,
  List,
  PinIcon,
} from 'lucide-react';
import {
  fetchMembersRequest,
  deleteMemberRequest,
  updateMemberRequest,
  updateMemberStatusRequest,
  createMemberRequest
} from '@/store/features/members/members.actions';
import type { AppDispatch } from '@/store/app/store';
import type { Member } from '@/types/membersType';
import type { Event } from '@/types/eventsTypes';
import PageHead from '@/components/shared/page-head';
import ErrorState from '@/components/partials/membersComponents/errorState';
import MemberDetailsDialog from '@/components/partials/membersComponents/MemberDetailsDialog';
import MemberEditDialog from '@/components/partials/membersComponents/MemberEditDialog';
import MemberAddDialog from '@/components/partials/membersComponents/MemberAddDialog';
import { MembersFilters } from '@/components/partials/membersComponents/MembersFilters';
import { MembersPagination } from '@/components/partials/membersComponents/MembersPagination';
import { filterMembers, sortMembers, type MembersFilters as MembersFiltersType, type MemberSortField, type MemberSortDirection } from '@/lib/members-utils';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/helperFunctions';
import { fetchEventParticipantsApi, updateGuestInvitationStatusApi } from '@/api/guestsApi';
import { fetchEvents } from '@/api/eventsApi';
import { cn } from '@/lib/utils';
import { getLayout, getLayoutPreferences, setLayoutPreferences } from '@/services/localStorage';
import { BA } from 'country-flag-icons/string/3x2';

const createPlaceholderDate = (): { $date: { $numberLong: string } } => ({
  $date: { $numberLong: `${Date.now()}` },
})

const ensureObjectId = (value?: any): { $oid: string } | string => {
  if (typeof value === 'string') return value
  if (value?.$oid) return value
  if (value?.$id) return { $oid: value.$id }
  return Math.random().toString(36).slice(2, 12)
}

const getMemberId = (id: { $oid: string } | string): string => {
  return typeof id === 'string' ? id : id.$oid
}

const allowedGenders: Member["gender"][] = ["MALE", "FEMALE", "Unspecified"]

interface MembersLocationState {
  eventFilter?: {
    id: string
    name: string
  }
  focusMemberId?: string
  focusMemberData?: Member
}

const normalizeParticipantToMember = (record: any): Member => {
  const source = record?.member || record;

  const normalizedGender = (source?.gender || 'OTHER').toString().toUpperCase();
  const genderValue: Member["gender"] = allowedGenders.includes(normalizedGender as Member["gender"])
    ? (normalizedGender as Member["gender"])
    : "Unspecified";

  // Handle different status formats from backend
  const normalizeStatus = (status: any): Member["status"] => {
    if (!status) return 'Unspecified';
    const statusStr = status.toString().toUpperCase();
    // Handle event participant statuses
    if (['PENDING', 'ACCEPTED', 'REFUSED', 'EXPIRED', 'CONFIRMED'].includes(statusStr)) {
      return statusStr as Member["status"];
    }
    // Handle member account statuses
    if (statusStr === 'ACTIVE') return 'Active';
    if (statusStr === 'INACTIVE') return 'Inactive';
    return 'Unspecified';
  };

  return {
    // Use the outer record._id (guest/participant ID) when it exists, otherwise fallback to member._id
    _id: ensureObjectId(record?._id || source?._id || record?.memberId),
    phoneNumber: source?.phoneNumber || '',
    birthday: source?.birthday || (source?.createdAt ? source.createdAt : createPlaceholderDate()),
    country: source?.country || source?.location?.country || '',
    city: source?.city || source?.location?.city || '',
    firstName: source?.firstName || source?.name?.split(' ')?.[0] || '',
    lastName: source?.lastName || source?.name?.split(' ')?.slice(1)?.join(' ') || '',
    email: source?.email || record?.email || '',
    gender: genderValue,
    picture: source?.picture || '',
    status: normalizeStatus(record?.status || source?.status),
    password: source?.password || '',
    verificationCode: source?.verificationCode || { code: '', createdAt: { $numberDouble: '0' } },
    role: ensureObjectId(source?.role?._id || source?.role || record?.roleId),
    isActive: source?.isActive ?? (record?.verified ?? true),
    registrationCompleted: source?.registrationCompleted ?? (record?.verified ?? true),
    favorites: source?.favorites || [],
    user: source?.user || '',
    createdAt: source?.createdAt || createPlaceholderDate(),
    updatedAt: source?.updatedAt || createPlaceholderDate(),
    __v: source?.__v || { $numberInt: '0' },
    // New fields from backend response
    qrCode: record?.qrCode,
    isOrganizator: record?.isOrganizator ?? false,
    verified: record?.verified ?? source?.verified,
    event: record?.event,
    invitedBy: source?.invitedBy,
    // Store the actual member profile ID for editing purposes
    memberId: record?.member?._id ? (typeof record.member._id === 'string' ? record.member._id : record.member._id.$oid) : undefined,
  };
};

type LayoutType = 'grid' | 'list';

export const MembersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { members, loading, error, total, pagination } = useSelector((state: RootState) => state.members) || {};
  const routeState = location.state as MembersLocationState | null;
  const preselectedEvent = routeState?.eventFilter ?? null;
  const routeEventHandledRef = useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [filters, setFilters] = useState<MembersFiltersType>({
    search: '',
    status: 'all',
    registrationStatus: 'all',
    gender: 'all',
  });

  const [layout, setLayout] = useState<LayoutType>(getLayoutPreferences().membersLayout); // Default to grid layout

  const [sort, setSort] = useState<{
    field: MemberSortField;
    direction: MemberSortDirection;
  }>({
    field: 'createdAt',
    direction: 'desc',
  });
  const { t } = useTranslation()

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [eventSelectorOpen, setEventSelectorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string } | null>(preselectedEvent ?? null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [exitConfirmOpen, setExitConfirmOpen] = useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusMember, setStatusMember] = useState<Member | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const navigate = useNavigate()


  const setLayoutfunc = (layout: LayoutType) => {
    setLayout(layout)
    setLayoutPreferences({
      ...getLayoutPreferences(),
      membersLayout: layout
    })
  }

  const filteredEvents = useMemo(() => {
    if (!eventSearchTerm.trim()) {
      return [];
    }
    const term = eventSearchTerm.toLowerCase();
    return availableEvents.filter((eventOption) =>
      eventOption.name?.toLowerCase().includes(term)
    );
  }, [availableEvents, eventSearchTerm]);

  const handleEventDialogOpenChange = (open: boolean) => {
    setEventSelectorOpen(open);
  };
  const handleReturnToPrevious = () => {
    setExitConfirmOpen(false);
    setEventSelectorOpen(false);
    navigate(-1)
  };

  const memberIdFromState = routeState?.focusMemberId
  const memberDataFromState = routeState?.focusMemberData

  useEffect(() => {
    if (!memberIdFromState && !memberDataFromState) return

    const clearFocusState = () => {
      if (!routeState?.eventFilter) {
        navigate(location.pathname, { replace: true, state: null })
      } else {
        navigate(location.pathname, { replace: true, state: { eventFilter: routeState.eventFilter } })
      }
    }

    if (memberDataFromState) {
      setSelectedMember(memberDataFromState)
      setDetailsDialogOpen(true)
      clearFocusState()
      return
    }

    if (memberIdFromState && members?.length) {
      const foundMember = members.find(member => {
        const id = typeof member._id === 'string' ? member._id : member._id?.$oid
        return id === memberIdFromState
      })
      if (foundMember) {
        setSelectedMember(foundMember)
        setDetailsDialogOpen(true)
        clearFocusState()
      }
    }
  }, [memberIdFromState, memberDataFromState, members, routeState, navigate, location.pathname])

  // Fetch members when page changes
  useEffect(() => {
    if (selectedEvent) return;
    dispatch(fetchMembersRequest(currentPage, pageSize));
  }, [dispatch, currentPage, pageSize, selectedEvent]);

  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true)
      setEventsError(null)
      try {
        const response = await fetchEvents()
        const data = Array.isArray(response?.data?.data) ? response.data.data : []
        setAvailableEvents(data)
      } catch (error: any) {
        console.error('Failed to load events', error)
        setEventsError(error?.response?.data?.message || error?.message || 'Unable to load events.')
      } finally {
        setEventsLoading(false)
      }
    }
    loadEvents()
  }, [])

  const [eventMembers, setEventMembers] = useState<Member[]>([]);
  const [eventMembersLoading, setEventMembersLoading] = useState(false);
  const [eventMembersError, setEventMembersError] = useState<string | null>(null);

  const loadMembersByEvent = useCallback(async (eventId: string) => {
    setEventMembersLoading(true)
    setEventMembersError(null)
    try {
      const response = await fetchEventParticipantsApi(eventId)
      const data = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : []
      setEventMembers(data.map(normalizeParticipantToMember))
    } catch (error: any) {
      setEventMembers([])
      setEventMembersError(error?.response?.data?.message || error?.message || t('members.events.error', 'Unable to load event members.'))
    } finally {
      setEventMembersLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (preselectedEvent && !routeEventHandledRef.current) {
      routeEventHandledRef.current = true;
      setSelectedEvent(preselectedEvent);
      setEventSelectorOpen(false);
      void loadMembersByEvent(preselectedEvent.id);
    }
  }, [preselectedEvent, loadMembersByEvent]);

  useEffect(() => {
    if (!eventSelectorOpen) {
      setEventSearchTerm('');
    }
  }, [eventSelectorOpen]);

  const refreshMemberSources = () => {
    if (selectedEvent) {
      void loadMembersByEvent(selectedEvent.id)
    } else {
      dispatch(fetchMembersRequest(currentPage, pageSize))
    }
  }

  const handleEventSelection = (eventOption: { id: string; name: string }) => {
    setSelectedEvent(eventOption)
    setEventSelectorOpen(false)
    void loadMembersByEvent(eventOption.id)
  }

  const handleClearEventFilter = () => {
    setSelectedEvent(null)
    setEventMembers([])
    setEventMembersError(null)
    dispatch(fetchMembersRequest(currentPage, pageSize))
  }

  const baseMembers = selectedEvent ? eventMembers : (members || [])

  // Filter and sort members
  const processedMembers = useMemo(() => {
    const filtered = filterMembers(baseMembers, filters);
    const sorted = sortMembers(filtered, sort.field, sort.direction);
    return sorted;
  }, [baseMembers, filters, sort.field, sort.direction]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setDetailsDialogOpen(true);
  };

  const handleEdit = (member: Member) => {
    // For event participants, use the actual member profile ID if available
    // Otherwise use the regular _id
    const editableMember = member.memberId 
      ? { ...member, _id: member.memberId } 
      : member;
    setSelectedMember(editableMember);
    setEditDialogOpen(true);
  };

  const handleSaveMember = async (memberId: string, data: Partial<Member>) => {
    setActionLoading(memberId);
    try {
      await dispatch(updateMemberRequest(memberId, data));
      toast.success(t('members.messages.updateSuccess', 'Member updated successfully'));
      setEditDialogOpen(false);
      setSelectedMember(null);
      refreshMemberSources();
    } catch (error: any) {
      toast.error(error?.message || t('members.messages.updateError', 'Failed to update member'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateMember = async (data: any) => {
    setActionLoading('create');
    try {
      await dispatch(createMemberRequest(data));
      toast.success(t('members.messages.createSuccess', 'Member created successfully'));
      setAddDialogOpen(false);
      if (!selectedEvent) {
        setCurrentPage(1); // Reset to first page
      } else {
        refreshMemberSources();
      }
    } catch (error: any) {
      toast.error(error?.message || t('members.messages.createError', 'Failed to create member'));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (member: Member) => {
    setActionLoading(member._id.toString());
    try {
      await dispatch(deleteMemberRequest(member._id.toString()));
      toast.success(t('members.messages.deleteSuccess', 'Member deleted successfully'));
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      const remainingMembers = (selectedEvent ? eventMembers : (members || [])).length - 1;
      if (!selectedEvent) {
        if (remainingMembers === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          dispatch(fetchMembersRequest(currentPage, pageSize));
        }
      } else {
        void loadMembersByEvent(selectedEvent.id);
      }
    } catch (error: any) {
      toast.error(error?.message || t('members.messages.deleteError', 'Failed to delete member'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (member: Member) => {
    setActionLoading(member._id.toString());

    try {
      const response: any = await dispatch(updateMemberStatusRequest(getMemberId(member._id), !member.isActive));
      if (response?.success) {
        toast.success(
          t(
            `members.messages.${!member.isActive ? 'activateSuccess' : 'deactivateSuccess'}`,
            `Member ${!member.isActive ? 'activated' : 'deactivated'} successfully`
          )
        );
        // Refresh data based on current filter state
        if (selectedEvent) {
          // If filtering by event, reload the event members data
          await loadMembersByEvent(selectedEvent.id);
        } else {
          // Otherwise, refresh regular members
          dispatch(fetchMembersRequest(currentPage, pageSize));
        }
      } else {
        toast.error(response?.message || t('members.messages.statusUpdateError', 'Failed to update member status'));
      }
    } catch (error: any) {
      toast.error(error?.message || t('members.messages.statusUpdateError', 'Failed to update member status'));
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (member: Member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const openStatusDialog = (member: Member) => {
    setStatusMember(member);
    setSelectedStatus(member.status || 'PENDING');
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusMember || !statusMember.event) {
      toast.error(t('members.messages.notEventParticipant', 'This member is not an event participant'));
      return;
    }

    const guestId = typeof statusMember._id === 'string' ? statusMember._id : statusMember._id.$oid;
    
    setStatusUpdating(true);
    try {
      await updateGuestInvitationStatusApi(guestId, selectedStatus as "PENDING" | "ACCEPTED" | "REFUSED" | "EXPIRED");
      toast.success(t('members.messages.statusUpdateSuccess', 'Participant status updated successfully'));
      setStatusDialogOpen(false);
      setStatusMember(null);
      
      // Refresh the event members list
      if (selectedEvent) {
        await loadMembersByEvent(selectedEvent.id);
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error?.response?.data?.message || error?.message || t('members.messages.statusUpdateError', 'Failed to update participant status'));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSort = (field: MemberSortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (field: MemberSortField) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  // Handle dropdown actions with event propagation stopped
  const handleDropdownAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const initialLoading = selectedEvent
    ? eventMembersLoading && eventMembers.length === 0
    : loading && (!members || members.length === 0)

  // Loading state
  if (initialLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Grid Card Component
  const GridCard = ({ member }: { member: Member }) => (
    <Card 
      key={getMemberId(member._id)} 
      className={cn(
        'overflow-hidden hover:shadow-md transition-all duration-200 relative',
        member.isActive ? 'border-green-200' : 'border-red-200'
      )}
      onClick={() => handleViewDetails(member)}
    >
      <CardContent className="p-4">
        {/* Avatar and Name Section */}
        <div className="flex flex-col items-center text-center mb-4">
          <Avatar className="w-16 h-16 mb-3">
            <AvatarImage src={member.picture} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="text-lg">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-base">
              {member.firstName} {member.lastName}
            </h3>
            {!selectedEvent && (
              <Badge
                className={cn(
                  'text-xs',
                  member.isActive 
                    ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                    : 'bg-red-100 text-red-800 hover:bg-red-100'
                )}
              >
                {member.isActive ? t('members.active') : t('members.inActive')}
              </Badge>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              {member.email || t('members.notAvailable', 'N/A')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">
              {t('members.joinedOn', 'Joined')} {formatDate(member.createdAt)}
            </span>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Additional Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              {t('members.registration.status', 'Registration')}
            </span>
            <div className="flex items-center gap-1">
              {member.registrationCompleted ? (
                <>
                  <CheckIcon className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 font-medium">
                    {t('members.registration.completed')}
                  </span>
                </>
              ) : (
                <>
                  <XIcon className="w-3 h-3 text-red-500" />
                  <span className="text-red-600 font-medium">
                    {t('members.registration.pending')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status badges if present */}
          {(member.verified !== undefined || member.isOrganizator || member.status) && (
            <div className="flex flex-wrap gap-1 pt-2">
              {member.verified !== undefined && (
                <Badge variant="outline" className={cn(
                  'text-xs',
                  member.verified 
                    ? 'border-green-300 text-green-700' 
                    : 'border-gray-300 text-gray-700'
                )}>
                  {member.verified ? t('members.verified', 'Verified') : t('members.unverified', 'Unverified')}
                </Badge>
              )}
              {member.isOrganizator && (
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                  👑 {t('members.organizer', 'Organizer')}
                </Badge>
              )}
              {member.status && ['PENDING','REFUSED', 'ACCEPTED', 'EXPIRED'].includes(member.status) && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    member.status === 'ACCEPTED' 
                      ? 'border-green-300 text-green-700' 
                      : member.status === 'PENDING' 
                        ? 'border-orange-300 text-orange-700' 
                        : 'border-red-300 text-red-700'
                  )}
                >
                  {t(`members.status.${member.status.toLowerCase()}`, member.status)}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Action Menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
              <DropdownMenuItem
                onClick={(e) => handleDropdownAction(e, () => handleViewDetails(member))}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('members.preview')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => handleDropdownAction(e, () => handleEdit(member))}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('members.edit')}
              </DropdownMenuItem>
              {!selectedEvent && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => handleDropdownAction(e, () => handleToggleStatus(member))}
                    disabled={actionLoading === getMemberId(member._id)}
                  >
                    {member.isActive ? (
                      <>
                        <UserX className="w-4 h-4 mr-2" />
                        {t('members.deactivated')}
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        {t('members.activated')}
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
              {member.event && member.status && ['PENDING', 'REFUSED', 'ACCEPTED', 'EXPIRED'].includes(member.status) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => handleDropdownAction(e, () => openStatusDialog(member))}
                  >
                    <PinIcon className="w-4 h-4 mr-2" />
                    {t('members.participantStatus', 'Participant status')}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => handleDropdownAction(e, () => openDeleteDialog(member))}
                className="text-destructive"
                disabled={actionLoading === getMemberId(member._id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('members.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  // List Row Component
  const ListRow = ({ member }: { member: Member }) => (
    <TableRow 
      key={getMemberId(member._id)} 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => handleViewDetails(member)}
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={member.picture} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="text-sm">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {member.firstName} {member.lastName}
            </div>
            <div className="text-xs text-muted-foreground">
              {member.email || t('members.notAvailable', 'N/A')}
            </div>
          </div>
        </div>
      </TableCell>
<TableCell className="py-3">
  <div className="flex items-center gap-2">
    {!selectedEvent && (
      <Badge
        className={cn(
          member.isActive 
            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
            : 'bg-red-100 text-red-800 hover:bg-red-100'
        )}
      >
        {member.isActive ? t('members.active') : t('members.inActive')}
      </Badge>
    )}
    
    {selectedEvent && (
      member.isOrganizator ? (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          👑 {t('members.organizer', 'Organizer')}
        </Badge>
      ) : (
        <Badge variant="outline" className="capitalize bg-blue-100 text-blue-800 hover:bg-blue-100">
          {t('members.member', 'Member')}
        </Badge>
      )
    )}
  </div>
</TableCell>
      {selectedEvent && (
        <TableCell className="py-3">
          {member.status && ['PENDING', 'REFUSED', 'ACCEPTED', 'EXPIRED'].includes(member.status) ? (
            <Badge
              className={cn(
                'font-medium',
                member.status === 'ACCEPTED' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                  : member.status === 'PENDING' 
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                    : member.status === 'EXPIRED'
                      ? 'bg-red-100 text-red-800 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
              )}
            >
              {t(`members.status.${member.status.toLowerCase()}`, member.status)}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">{t('members.notAvailable', 'N/A')}</span>
          )}
        </TableCell>
      )}


      <TableCell className="py-3">
        <div className="flex items-center gap-1">
          {member.registrationCompleted ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium text-sm">
                {t('members.registration.completed')}
              </span>
            </>
          ) : (
            <>
              <XIcon className="w-4 h-4 text-red-500" />
              <span className="text-red-600 font-medium text-sm">
                {t('members.registration.pending')}
              </span>
            </>
          )}
        </div>
      </TableCell>
      {selectedEvent && (
        <TableCell className="py-3">
          {member.verified !== undefined ? (
            <div className="flex items-center gap-1">
              {member.verified ? (
                <>
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium text-sm">
                    {t('members.verified', 'Verified')}
                  </span>
                </>
              ) : (
                <>
                  <XIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium text-sm">
                    {t('members.unverified', 'Unverified')}
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">{t('members.notAvailable', 'N/A')}</span>
          )}
        </TableCell>
      )}
      <TableCell className="py-3">
        <span className="text-sm">{formatDate(member.createdAt)}</span>
      </TableCell>
      <TableCell className="py-3">
        <span className="text-sm capitalize">{t(`members.gender.${member.gender?.toLowerCase() || 'unspecified'}`, member.gender || 'Unspecified')}</span>
      </TableCell>
      <TableCell className="py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50">
            <DropdownMenuItem
              onClick={(e) => handleDropdownAction(e, () => handleViewDetails(member))}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('members.preview')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleDropdownAction(e, () => handleEdit(member))}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('members.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!selectedEvent && (
              <DropdownMenuItem
                onClick={(e) => handleDropdownAction(e, () => handleToggleStatus(member))}
                disabled={actionLoading === getMemberId(member._id)}
              >
                {member.isActive ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    {t('members.deactivated')}
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    {t('members.activated')}
                  </>
                )}
              </DropdownMenuItem>
            )}
            {member.event && member.status && ['PENDING', 'REFUSED', 'ACCEPTED', 'EXPIRED'].includes(member.status) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => handleDropdownAction(e, () => openStatusDialog(member))}
                >
                  <PinIcon className="w-4 h-4 mr-2" />
                  {t('members.participantStatus', 'Participant status')}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => handleDropdownAction(e, () => openDeleteDialog(member))}
              className="text-destructive"
              disabled={actionLoading === getMemberId(member._id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('members.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHead
          title={t('members.title')}
          icon={Users}
          description={t('members.description')}
          total={total ?? 0}
        />
        <div className="flex items-center gap-3">
          {/* Layout Toggle */}
          <Tabs 
            value={layout} 
            onValueChange={(value) => setLayoutfunc(value as LayoutType)}
            className="w-auto"
          >
            <TabsList className="grid w-20 grid-cols-2">
              <TabsTrigger value="grid" className="h-8 px-2">
                <Grid3x3 className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="h-8 px-2">
                <List className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('members.addMember')}
          </Button> */}
        </div>
      </div>

      {/* Filters */}
      <MembersFilters filters={filters} onFiltersChange={setFilters} />

      <Card className="border-slate-300 py-0">
        <CardContent className="flex flex-col gap-4 p-2 px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('members.events.selectorLabel', 'Current event selection')}
              </p>
              {selectedEvent ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="default" className="text-xs my-2">
                    {selectedEvent.name}
                  </Badge>
                  {eventMembersLoading && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t('members.events.loadingParticipants', 'Loading participants...')}
                    </span>
                  )}
                  {!eventMembersLoading && (
                    <span className="text-xs text-muted-foreground">
                      {t('members.events.participantsCount', '{{count}} participants', { count: eventMembers.length })}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('members.events.noSelection', 'Select an event to focus on its participants.')}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEventSelectorOpen(true)}>
                {selectedEvent ? t('members.events.changeEvent', 'Change event') : t('members.events.selectEvent', 'Select event')}
              </Button>
              {selectedEvent && (
                <Button variant="ghost" size="sm" onClick={handleClearEventFilter}>
                  {t('members.events.clearSelection', 'Clear')}
                </Button>
              )}
            </div>
          </div>
          {eventMembersError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {eventMembersError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sort Options */}
      <Card className="py-0">
        <CardContent className="py-2">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <span className="text-sm font-medium text-muted-foreground">
              {t('members.sort.by')}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('firstName')}
                className="gap-2 text-xs"
              >
                {t('members.sort.name')} {getSortIcon('firstName')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('email')}
                className="gap-2 text-xs"
              >
                {t('members.sort.email')} {getSortIcon('email')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('createdAt')}
                className="gap-2 text-xs"
              >
                {t('members.sort.dateJoing')} {getSortIcon('createdAt')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('isActive')}
                className="gap-2 text-xs"
              >
                {t('members.sort.status')} {getSortIcon('isActive')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <ErrorState error={error} />
      )}

      {/* Members Display - Grid or List */}
      {processedMembers.length > 0 ? (
        <>
          {layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {processedMembers.map((member) => (
                <GridCard key={getMemberId(member._id)} member={member} />
              ))}
            </div>
          ) : (
            <Card className="p-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">{t('members.list.name', 'Name')}</TableHead>

                        {
                          !selectedEvent ? (
                            <TableHead className="font-semibold">{t('members.list.status', 'Status')}</TableHead>
                          ) : (
                             <TableHead className="font-semibold">{t('members.list.type', 'Member Type')}</TableHead>
                          )
                        }


                        {selectedEvent && <TableHead className="font-semibold">{t('members.list.participantStatus', 'Participant Status')}</TableHead>}
                        <TableHead className="font-semibold">{t('members.list.registration', 'Registration')}</TableHead>
                        {selectedEvent && <TableHead className="font-semibold">{t('members.list.verified', 'Verified')}</TableHead>}
                        <TableHead className="font-semibold">{t('members.list.joinDate', 'Join Date')}</TableHead>
                        <TableHead className="font-semibold">{t('members.list.gender', 'Gender')}</TableHead>
                        <TableHead className="text-right font-semibold">{t('members.list.actions', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200">
                      {processedMembers.map((member) => (
                        <ListRow key={getMemberId(member._id)} member={member} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">
              {t('members.emptyState.title', 'No Members Found')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filters.search || filters.status !== 'all' || filters.registrationStatus !== 'all' || filters.gender !== 'all'
                ? t('members.emptyState.noResults', 'No members match your search criteria.')
                : t('members.emptyState.noMembers', 'No members have been added yet.')}
            </p>
            {(filters.search || filters.status !== 'all' || filters.registrationStatus !== 'all' || filters.gender !== 'all') ? (
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: 'all',
                  registrationStatus: 'all',
                  gender: 'all',
                })}
              >
                {t('members.clearFilters', 'Clear Filters')}
              </Button>
            ) : (
              // <Button onClick={() => setAddDialogOpen(true)}>
              //   <Plus className="w-4 h-4 mr-2" />
              //   {t('members.addFirstMember', 'Add First Member')}
              // </Button>
              null
            )}
          </CardContent>
        </Card>
      )}

      {/* Member Details Dialog */}
      <MemberDetailsDialog
        member={selectedMember}
        isOpen={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedMember(null);
        }}
        onEdit={handleEdit}
        onDelete={openDeleteDialog}
      />

      {/* Member Edit Dialog */}
      <MemberEditDialog
        member={selectedMember}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleSaveMember}
        isLoading={actionLoading === selectedMember?._id.toString()}
      />

      {/* Member Add Dialog */}
      <MemberAddDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleCreateMember}
        isLoading={actionLoading === 'create'}
      />

      <Dialog open={eventSelectorOpen} onOpenChange={handleEventDialogOpenChange}>
        <DialogContent className="lg:max-w-3xl  md:max-w-xl  border-slate-300">
          <DialogHeader className='relative'>
            <DialogTitle>{t('members.events.dialog.title', 'Select an event')}</DialogTitle>
            <DialogDescription>
              {t('members.events.dialog.description', 'Search for an event to display its registered members.')}
            </DialogDescription>
          </DialogHeader>
          {eventsLoading ? (
            <div className="space-y-3 pt-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : eventsError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {eventsError}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={eventSearchTerm}
                  onChange={(e) => setEventSearchTerm(e.target.value)}
                  placeholder={t('members.events.dialog.searchPlaceholder', 'Type to search events by name...')}
                  className="pl-10"
                />
              </div>
              
              {eventSearchTerm.trim() ? (
                filteredEvents.length > 0 ? (
                  <ScrollArea className="max-h-[420px] pr-4 overflow-y-auto">
                    <div className="space-y-3">
                      {filteredEvents.map((eventOption) => (
                        <Card
                          key={eventOption._id}
                          className="cursor-pointer py-2 border-slate-300 transition hover:border-slate-500"
                          onClick={() => handleEventSelection({ id: eventOption._id, name: eventOption.name })}
                        >
                          <CardContent>
                            <span className="font-bold truncate">{eventOption.name}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="rounded-md border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                    {t('members.events.dialog.noResults', 'No events match your search. Try typing a different name.')}
                  </div>
                )
              ) : (
                <div className="rounded-md border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                  {t('members.events.dialog.startTyping', 'Start typing in the search bar to find events.')}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('members.events.exitConfirm.title', 'Event Selection Required')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('members.events.exitConfirm.description', 'You must select an event to view its participants. Would you like to return to the previous page?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExitConfirmOpen(false)}>
              {t('members.events.exitConfirm.stay', 'Stay Here')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReturnToPrevious}>
              {t('members.events.exitConfirm.return', 'Return to Previous Page')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination */}
      {!selectedEvent && pagination && (
        <MembersPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* Participant Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="md:max-w-lg border-slate-300">
          <DialogHeader>
            <DialogTitle>
              {t('members.statusDialog.title', 'Change Participant Status')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'members.statusDialog.description',
                'Update the invitation status for {{name}}',
                { name: `${statusMember?.firstName} ${statusMember?.lastName}` }
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-select">
                {t('members.statusDialog.statusLabel', 'Invitation Status')}
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={statusUpdating}
              >
                <SelectTrigger id="status-select" className="w-full">
                  <SelectValue>
                    {statusUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />}
                    {selectedStatus ? t(`members.status.${selectedStatus.toLowerCase()}`, selectedStatus) : t('members.statusDialog.selectStatus', 'Select Status')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                        {t('members.statusDialog.pending', 'PENDING')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACCEPTED">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {t('members.statusDialog.accepted', 'ACCEPTED')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="REFUSED">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        {t('members.statusDialog.refused', 'REFUSED')}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="EXPIRED">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        {t('members.statusDialog.expired', 'EXPIRED')}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {statusMember?.qrCode && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>{t('members.statusDialog.qrCode', 'QR Code')}:</strong> {statusMember.qrCode}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false);
                setStatusMember(null);
              }}
              disabled={statusUpdating}
            >
              {t('members.cancel', 'Cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleStatusUpdate}
              disabled={statusUpdating || !selectedStatus}
            >
              {statusUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('members.statusDialog.updating', 'Updating...')}
                </>
              ) : (
                t('members.statusDialog.update', 'Update Status')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('members.deleteDialog.title', 'Delete Member')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'members.deleteDialog.description',
                'Are you sure you want to delete This action cannot be undone.',
                { name: `${selectedMember?.firstName} ${selectedMember?.lastName}` }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedMember(null);
              }}
              disabled={!!(selectedMember && actionLoading === getMemberId(selectedMember._id))}
            >
              {t('members.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedMember && handleDelete(selectedMember)}
              disabled={!!(selectedMember && actionLoading === getMemberId(selectedMember._id))}
              className="bg-destructive text-gray-100 hover:bg-destructive/90"
            >
              {selectedMember && actionLoading === getMemberId(selectedMember._id) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('members.deleting', 'Deleting...')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('members.delete', 'Delete')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembersPage;