import React, { useEffect, useState, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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


export const MembersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error, total, pagination } = useSelector((state: RootState) => state.members) || {};
  
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

  // Fetch members when page changes
  useEffect(() => {
    dispatch(fetchMembersRequest(currentPage, pageSize));
  }, [dispatch, currentPage, pageSize]);

  // Filter and sort members
  const processedMembers = useMemo(() => {
    const filtered = filterMembers(members || [], filters);
    const sorted = sortMembers(filtered, sort.field, sort.direction);
    return sorted;
  }, [members, filters, sort.field, sort.direction]);

 

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
      // Refresh current page
      dispatch(fetchMembersRequest(currentPage, pageSize));
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
      setCurrentPage(1); // Reset to first page
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
      // Refresh current page, or go to previous page if current page is empty
      const remainingMembers = (members || []).length - 1;
      if (remainingMembers === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        dispatch(fetchMembersRequest(currentPage, pageSize));
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
      await dispatch(updateMemberStatusRequest(member._id.toString(), !member.isActive));
      toast.success(
        t(
          `members.messages.${!member.isActive ? 'activateSuccess' : 'deactivateSuccess'}`,
          `Member ${!member.isActive ? 'activated' : 'deactivated'} successfully`
        )
      );
      // Refresh current page
      dispatch(fetchMembersRequest(currentPage, pageSize));
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

  // Loading state
  if (loading && (!members || members.length === 0)) {
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
        />
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('members.addMember')}
        </Button>
      </div>

      {/* Filters */}
      <MembersFilters filters={filters} onFiltersChange={setFilters} />

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
            <Card key={member._id.$oid} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t('members.preview')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(member)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('members.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(member)}
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
                        onClick={() => openDeleteDialog(member)}
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
                        {[member.city, member.country].filter(Boolean).join(', ')}
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
                  <span>{member.user || t('members.notAvailable', 'N/A')}</span>
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

      {/* Pagination */}
      {pagination && (
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