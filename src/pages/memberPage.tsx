import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/app/rootReducer';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Icons
import {
  Search,
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
  Filter,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { fetchMembersRequest } from '@/store/features/members/members.actions';
import type { AppDispatch } from '@/store/app/store';
import type { Member } from '@/types/membersType';

export const MembersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members = [], loading, error, total = 0 } = useSelector((state: RootState) => state.members) || {};
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch members on component mount
  useEffect(() => {
    dispatch(fetchMembersRequest());
  }, [dispatch]);

  // Filter members based on search term
  const filteredMembers = (members || []).filter(member =>
    (member.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (member.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (member.phoneNumber || '').includes(searchTerm)
  );

  const formatDate = (dateInput: any): string => {
    try {
      if (!dateInput) return 'N/A';
      
      let timestamp: number;
      
      if (typeof dateInput === 'string') {
        timestamp = parseInt(dateInput);
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        timestamp = parseInt(dateInput.$date.$numberLong);
      } else if (dateInput.$numberLong) {
        timestamp = parseInt(dateInput.$numberLong);
      } else if (typeof dateInput === 'number') {
        timestamp = dateInput;
      } else {
        return 'N/A';
      }
      
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleEdit = (member: Member) => {
    // Navigate to edit page or open edit modal
    console.log('Edit member:', member);
    // history.push(`/members/${member._id.$oid}/edit`);
  };

  const handleViewDetails = (member: Member) => {
    // Navigate to details page
    console.log('View details:', member);
    // history.push(`/members/${member._id.$oid}`);
  };

  const handleDelete = async (member: Member) => {
    setActionLoading(member._id.$oid);
    try {
      // TODO: Implement delete member action
      // await dispatch(deleteMemberRequest(member._id.$oid));
      console.log('Delete member:', member._id.$oid);
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to delete member:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (member: Member) => {
    setActionLoading(member._id.$oid);
    try {
      // TODO: Implement toggle status action
      // await dispatch(toggleMemberStatusRequest(member._id.$oid));
      console.log('Toggle status for:', member._id.$oid);
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (member: Member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  // Loading state
  if (loading && members.length === 0) {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8" />
            Members
          </h1>
          <p className="text-muted-foreground">
            Manage your organization members ({total} total members)
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Error Loading Members</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              className="mt-4" 
              onClick={() => dispatch(fetchMembersRequest())}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
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
                        {member.isActive ? 'Active' : 'Inactive'}
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
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(member)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleToggleStatus(member)}
                        disabled={actionLoading === member._id.$oid}
                      >
                        {member.isActive ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate
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
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{member.email || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{member.phoneNumber || 'N/A'}</span>
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
                      Joined {formatDate(member.createdAt)}
                    </span>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Registration {member.registrationCompleted ? 'Completed' : 'Pending'}</span>
                  <span>{member.user || 'N/A'}</span>
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
            <h3 className="font-semibold">No Members Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'No members match your search criteria.' : 'No members have been added yet.'}
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            ) : (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedMember?.firstName} {selectedMember?.lastName}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading === selectedMember?._id.$oid}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedMember && handleDelete(selectedMember)}
              disabled={actionLoading === selectedMember?._id.$oid}
            >
              {actionLoading === selectedMember?._id.$oid ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersPage;