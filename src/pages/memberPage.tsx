import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
} from '@/components/ui/dialog';
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
import { fetchEventParticipantsApi } from '@/api/guestsApi';
import { fetchEvents } from '@/api/eventsApi';
import { DialogClose } from '@radix-ui/react-dialog';
import { Alert, AlertTitle } from '@/components/ui/alert';


const createPlaceholderDate = (): { $date: { $numberLong: string } } => ({
  $date: { $numberLong: `${Date.now()}` },
})

const ensureObjectId = (value?: any): { $oid: string } => {
  if (typeof value === 'string') return { $oid: value }
  if (value?.$oid) return value
  if (value?.$id) return { $oid: value.$id }
  return { $oid: Math.random().toString(36).slice(2, 12) }
}

const allowedGenders: Member["gender"][] = ["MALE", "FEMALE", "OTHER"]

interface MembersLocationState {
  eventFilter?: {
    id: string
    name: string
  }
}

const normalizeParticipantToMember = (record: any): Member => {
  const source = record?.memberDetails || record;

  const normalizedGender = (source?.gender || 'OTHER').toString().toUpperCase();
  const genderValue: Member["gender"] = allowedGenders.includes(normalizedGender as Member["gender"])
    ? (normalizedGender as Member["gender"])
    : "OTHER";


  return {
    _id: ensureObjectId(source?._id || record?.member || record?.memberId),
    phoneNumber: source?.phoneNumber || '',
    birthday: source?.birthday || createPlaceholderDate(),
    country: source?.country || source?.location?.country || '',
    city: source?.city || source?.location?.city || '',
    firstName: source?.firstName || source?.name?.split(' ')?.[0] || '',
    lastName: source?.lastName || source?.name?.split(' ')?.slice(1)?.join(' ') || '',
    email: source?.email || record?.email || '',
    gender: genderValue,
    picture: source?.picture || '',
    password: source?.password || '',
    verificationCode: source?.verificationCode || { code: '', createdAt: { $numberDouble: '0' } },
    role: ensureObjectId(source?.role?._id || source?.role || record?.roleId),
    isActive: source?.isActive ?? true,
    registrationCompleted: source?.registrationCompleted ?? true,
    favorites: source?.favorites || [],
    user: source?.user || '', // This should be "Member" string from your data
    createdAt: source?.createdAt || createPlaceholderDate(),
    updatedAt: source?.updatedAt || createPlaceholderDate(),
    __v: source?.__v || { $numberInt: '0' },
  };
};

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
  const [eventSelectorOpen, setEventSelectorOpen] = useState(() => !preselectedEvent);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; name: string } | null>(preselectedEvent ?? null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const filteredEvents = useMemo(() => {
    if (!eventSearchTerm.trim()) {
      return availableEvents;
    }
    const term = eventSearchTerm.toLowerCase();
    return availableEvents.filter((eventOption) =>
      eventOption.name?.toLowerCase().includes(term)
    );
  }, [availableEvents, eventSearchTerm]);

  const handleEventDialogOpenChange = (open: boolean) => {
    // Prevent closing the dialog when no event is selected
    if (!open && !selectedEvent) {
      return(
        toast.warning('ddddddddddd')
      )
      // return;
    }
    setEventSelectorOpen(open);
  };

  // Fetch members when page changes
  useEffect(() => {
    if (selectedEvent || eventSelectorOpen) return;
    dispatch(fetchMembersRequest(currentPage, pageSize));
  }, [dispatch, currentPage, pageSize, selectedEvent, eventSelectorOpen]);

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
    setEventSelectorOpen(true)
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
    setSelectedMember(member);
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
      const response: any = await dispatch(updateMemberStatusRequest(member._id.$oid.toString(), !member.isActive));
      if (response?.success) {
      toast.success(
        t(
          `members.messages.${!member.isActive ? 'activateSuccess' : 'deactivateSuccess'}`,
          `Member ${!member.isActive ? 'activated' : 'deactivated'} successfully`
        )
      );
      refreshMemberSources();
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHead 
          title={t('members.title')}
          icon={Users} 
          description={t('members.description')} 
          total={total ?? 0}
        />
        {/* <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('members.addMember')}
        </Button> */}
      </div>

      {/* Filters */}
      <MembersFilters filters={filters} onFiltersChange={setFilters} />

      <Card className="border-slate-300">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('members.events.selectorLabel', 'Current event selection')}
              </p>
              {selectedEvent ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="default" className="text-base">
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <span className="text-sm font-medium text-muted-foreground">
              {t('members.sort.by')}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('firstName')}
                className="gap-2"
              >
                {t('members.sort.name')} {getSortIcon('firstName')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('email')}
                className="gap-2"
              >
                {t('members.sort.email')} {getSortIcon('email')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('createdAt')}
                className="gap-2"
              >
                {t('members.sort.dateJoing')} {getSortIcon('createdAt')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('isActive')}
                className="gap-2"
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

      {/* Members Grid */}
      {processedMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedMembers.map((member) => (
            <Card key={member._id.$oid} className="overflow-hidden hover:shadow-lg cursor-pointer transition-shadow" onClick={() => handleViewDetails(member)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.picture} alt={`${member.firstName} ${member.lastName}`} />
                      <AvatarFallback className="text-sm">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight">
                        {member.firstName} {member.lastName}
                      </h3>
                      <Badge 
                        variant={member.isActive ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {member.isActive ? t('members.active') : t('members.inActive')}
                      </Badge>
                    </div>
                  </div>
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
                      <DropdownMenuItem 
                        onClick={(e) => handleDropdownAction(e, () => handleToggleStatus(member))}
                        disabled={actionLoading === member._id.$oid}
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => handleDropdownAction(e, () => openDeleteDialog(member))}
                        className="text-destructive"
                        disabled={actionLoading === member._id.$oid}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('members.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {member.email || t('members.notAvailable', 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {member.phoneNumber || t('members.notAvailable', 'N/A')}
                    </span>
                  </div>

                  {(member.city || member.country) && (
  <div className="flex items-center space-x-2 text-sm">
    <MapPin className="w-4 h-4 text-muted-foreground" />
    <span className="text-muted-foreground">
      {[
        typeof member.city === 'string' ? member.city : '',
        typeof member.country === 'string' ? member.country : ''
      ].filter(Boolean).join(', ')}
    </span>
  </div>
)}

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t('members.joinedOn', 'Joined')} {formatDate(member.createdAt)}
                    </span>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {t('members.registration.status', 'Registration')}{' '}
                    {member.registrationCompleted ? 
                      t('members.registration.completed') : 
                      t('members.registration.pending')
                    }
                  </span>
                  <span>
  {typeof member.user === 'object' 
    ? member.user?.firstName || t('members.notAvailable', 'N/A')
    : member.user || t('members.notAvailable', 'N/A')
  }
</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('members.addFirstMember', 'Add First Member')}
              </Button>
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
        <DialogContent className="max-w-3xl border-slate-300">
          <DialogHeader className='relative'>
            <DialogTitle>{t('members.events.dialog.title', 'Select an event')}</DialogTitle>
            <DialogDescription>
              {t('members.events.dialog.description', 'Choose an event to display its registered members.')}
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
          ) : availableEvents.length === 0 ? (
            <div className="rounded-md border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
              {t('members.events.dialog.empty', 'No events available at the moment.')}
            </div>
          ) : (
            <div className="space-y-4 pt-4 overflow-y-auto">
              <Input
                value={eventSearchTerm}
                onChange={(e) => setEventSearchTerm(e.target.value)}
                placeholder={t('members.events.dialog.searchPlaceholder', 'Search events by name')}
              />
              <ScrollArea className="max-h-[420px] pr-4">
                <div className="space-y-3">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((eventOption) => (
                      <Card
                      key={eventOption._id}
                      className="cursor-pointer border-slate-300 transition hover:border-slate-500 object-cover"
                      onClick={() => handleEventSelection({ id: eventOption._id, name: eventOption.name })}
                      style={{
                        backgroundImage: `url(${eventOption.image})`,
                        backgroundPosition:"center",
                        backgroundSize:'cover',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <CardContent className="flex flex-col gap-1 py-4 backdrop-blur-2xl bg-white/20 mx-4 rounded-md shadow-md text-gray-100" >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate">{eventOption.name}</span>
                          <Badge variant="default">{eventOption.status}</Badge>
                        </div>
                        <span className="text-sm text-gray-200">
                          {formatDate(eventOption.startDate?.date)}
                        </span>
                        <span className="text-xs text-gray-200">
                          {/* Fix: Safely access location properties */}
                          {[
                            typeof eventOption.location === 'object' && eventOption.location !== null 
                              ? eventOption.location.city 
                              : null,
                            typeof eventOption.location === 'object' && eventOption.location !== null 
                              ? eventOption.location.country 
                              : eventOption.location // fallback if it's a string
                          ].filter(Boolean).join(', ')}
                        </span>
                      </CardContent>
                    </Card>
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                      {t('members.events.dialog.noResults', 'No events match your search.')}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {!selectedEvent && pagination && (
        <MembersPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

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
              disabled={actionLoading === selectedMember?._id.$oid}
            >
              {t('members.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedMember && handleDelete(selectedMember)}
              disabled={actionLoading === selectedMember?._id.$oid}
              className="bg-destructive text-gray-100 hover:bg-destructive/90"
            >
              {actionLoading === selectedMember?._id.$oid ? (
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