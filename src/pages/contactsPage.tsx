import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Icons
import {
  MoreVertical,
  Trash2,
  Mail,
  Calendar as CalendarIcon,
  Filter,
  X,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';

import { fetchContactsApi, deleteContactApi, type Contact } from '@/api/contactsApi';
import PageHead from '@/components/shared/page-head';
import { cn } from '@/lib/utils';

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Date filter state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Fetch contacts
  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchContactsApi();
        // Handle both array and object with data property
        const contactsData = Array.isArray(response.data.data) 
          ? response.data.data
          : response.data?.data || response.data?.contacts || [];
        setContacts(contactsData);
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
        setError(err?.response?.data?.message || 'Failed to fetch contacts');
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Format date from backend response
  const formatDate = (dateInput: any): Date | null => {
    try {
      if (!dateInput) return null;
      
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
        return null;
      }
      
      return new Date(timestamp);
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  // Format date for display
  const formatDateDisplay = (dateInput: any): string => {
    const date = formatDate(dateInput);
    if (!date) return 'N/A';
    return format(date, 'PPP');
  };

  const formatDateTimeDisplay = (dateInput: any): string => {
    const date = formatDate(dateInput);
    if (!date) return 'N/A';
    return format(date, 'PPP p');
  };

  // Filter contacts by date range
  const filteredContacts = useMemo(() => {
    if (!startDate && !endDate) return contacts;

    return contacts.filter((contact) => {
      const contactDate = formatDate(contact.createdAt);
      if (!contactDate) return false;

      if (startDate && endDate) {
        // Set time to start/end of day for proper comparison
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const contact = new Date(contactDate);
        contact.setHours(0, 0, 0, 0);
        
        return contact >= start && contact <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const contact = new Date(contactDate);
        contact.setHours(0, 0, 0, 0);
        return contact >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const contact = new Date(contactDate);
        contact.setHours(0, 0, 0, 0);
        return contact <= end;
      }

      return true;
    });
  }, [contacts, startDate, endDate]);

  const handleDelete = async (contact: Contact) => {
    setActionLoading(contact._id);
    try {
      await deleteContactApi(contact._id);
      toast.success('Contact deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedContact(null);
      // Remove from local state
      setContacts((prev) => prev.filter((c) => c._id !== contact._id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete contact');
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Loading state
  if (loading && contacts.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
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
          title='Contacts' 
          icon={Mail} 
          description={`Manage contact messages (${filteredContacts.length} ${filteredContacts.length === 1 ? 'message' : 'messages'})`} 
        />
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Date Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(startDate || endDate) && (
              <Button
                variant="outline"
                onClick={clearDateFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-2">{error}</div>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contacts Grid */}
      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{contact.subject}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDateDisplay(contact.createdAt)}
                    </Badge>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(contact)}
                        className="text-destructive"
                        disabled={actionLoading === contact._id}
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
                  <div className="flex items-start space-x-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-muted-foreground line-clamp-3">
                      {contact.message}
                    </p>
                  </div>
                  
                  <Separator />

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>Created: {formatDateTimeDisplay(contact.createdAt)}</span>
                    </div>
                    {contact.user && (
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>User ID: {contact.user}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No Contacts Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {startDate || endDate
                ? 'No contacts match your date filter criteria.' 
                : 'No contact messages have been received yet.'}
            </p>
            {(startDate || endDate) && (
              <Button 
                variant="outline" 
                onClick={clearDateFilters}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the contact message "{selectedContact?.subject}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedContact(null);
              }}
              disabled={actionLoading === selectedContact?._id}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedContact && handleDelete(selectedContact)}
              disabled={actionLoading === selectedContact?._id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === selectedContact?._id ? (
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactsPage;

