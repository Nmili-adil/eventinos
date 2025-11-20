import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

import PageHead from '@/components/shared/page-head';
import { cn } from '@/lib/utils';

import {
  fetchContactsApi,
  deleteContactApi,
  replyToContactApi,
  type Contact,
  type ContactsPagination,
} from '@/api/contactsApi';

import { MembersPagination } from '@/components/partials/membersComponents/MembersPagination';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import {
  MoreVertical,
  Trash2,
  Mail,
  Calendar as CalendarIcon,
  Filter,
  X,
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
} from 'lucide-react';

interface ConversationMessage {
  id: string;
  direction: 'incoming' | 'outgoing';
  body: string;
  timestamp: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [pagination, setPagination] = useState<ContactsPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [conversationMap, setConversationMap] = useState<Record<string, ConversationMessage[]>>({});

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchContactsApi(currentPage, PAGE_SIZE);
        const raw = response?.data;
        const contactsData = Array.isArray(raw?.data)
          ? raw?.data
          : raw?.contacts || raw?.data?.data || [];

        setContacts(contactsData);
        setPagination(raw?.pagination ?? raw?.meta ?? null);

        setConversationMap((prev) => {
          const next = { ...prev };
          contactsData.forEach((contact) => {
            if (!next[contact._id]) {
              next[contact._id] = [
                {
                  id: contact._id,
                  direction: 'incoming',
                  body: contact.message,
                  timestamp: contact.createdAt,
                },
              ];
            }
          });
          return next;
        });

        if (!selectedContact && contactsData.length > 0) {
          setSelectedContact(contactsData[0]);
        }
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
        setError(err?.response?.data?.message || 'Failed to fetch contacts');
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [currentPage]);

  const formatDate = (dateInput: any): Date | null => {
    try {
      if (!dateInput) return null;

      let timestamp: number;

      if (typeof dateInput === 'string') {
        const parsed = Date.parse(dateInput);
        timestamp = Number.isNaN(parsed) ? parseInt(dateInput, 10) : parsed;
      } else if (dateInput.$date && dateInput.$date.$numberLong) {
        timestamp = parseInt(dateInput.$date.$numberLong, 10);
      } else if (dateInput.$numberLong) {
        timestamp = parseInt(dateInput.$numberLong, 10);
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

  const filteredContacts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    const bySearch = contacts.filter((contact) => {
      if (!searchLower) return true;
      const subject = contact.subject?.toLowerCase() ?? '';
      const message = contact.message?.toLowerCase() ?? '';
      const name = `${contact.user?.firstName ?? ''} ${contact.user?.lastName ?? ''}`.toLowerCase();
      const email = contact.user?.email?.toLowerCase() ?? '';
      return (
        subject.includes(searchLower) ||
        message.includes(searchLower) ||
        name.includes(searchLower) ||
        email.includes(searchLower)
      );
    });

    if (!startDate && !endDate) return bySearch;

    return bySearch.filter((contact) => {
      const contactDate = formatDate(contact.createdAt);
      if (!contactDate) return false;

      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const date = new Date(contactDate);
        date.setHours(0, 0, 0, 0);
        return date >= start && date <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const date = new Date(contactDate);
        date.setHours(0, 0, 0, 0);
        return date >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const date = new Date(contactDate);
        date.setHours(0, 0, 0, 0);
        return date <= end;
      }

      return true;
    });
  }, [contacts, searchTerm, startDate, endDate]);

  const handleDelete = async (contact: Contact) => {
    setActionLoading(contact._id);
    try {
      await deleteContactApi(contact._id);
      toast.success('Contact deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedContact((prev) => (prev?._id === contact._id ? null : prev));
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

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      await replyToContactApi(selectedContact._id, { message: replyMessage.trim() });
      const outgoing: ConversationMessage = {
        id: `out-${Date.now()}`,
        direction: 'outgoing',
        body: replyMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      setConversationMap((prev) => ({
        ...prev,
        [selectedContact._id]: [...(prev[selectedContact._id] ?? []), outgoing],
      }));
      setReplyMessage('');
      toast.success('Reply sent successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const conversationMessages = selectedContact
    ? conversationMap[selectedContact._id] ?? []
    : [];

  if (loading && contacts.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-3 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto  space-y-4">
      <PageHead
        title="Inbox"
        icon={Mail}
        description="Manage and respond to user inquiries"
      />

      <Card className="py-2 gap-1">
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 ">
                {/* <label className="text-sm font-medium text-muted-foreground">Start Date</label> */}
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

              <div className="flex-1">
               
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
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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

      <Card className="overflow-hidden p-0" >
        <div className="flex flex-col lg:flex-row h-[calc(100vh-320px)]">
          <div className="w-full lg:w-1/3 border-b lg:border-r lg:border-b-0 flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Messages ({filteredContacts.length})
              </h3>
            </div>
            <ScrollArea className="flex-1 max-h-[calc(100vh-200px)] overflow-y-auto pb-4">
              <div>
                {filteredContacts.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No messages found.
                  </div>
                )}
                {filteredContacts.map((contact) => {
                  const isActive = selectedContact?._id === contact._id;
                  return (
                    <button
                      key={contact._id}
                      type="button"
                      onClick={() => handleSelectContact(contact)}
                      className={cn(
                        "w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/60 transition border-b border-slate-300",
                        isActive && "bg-muted bg-slate-500/30"
                      )}
                    >
                      <div className="flex-shrink-0">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
                          {contact.user?.picture ? (
                            <img
                              src={contact.user.picture}
                              alt={`${contact.user.firstName} ${contact.user.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (contact.user?.firstName?.[0] ?? 'U')
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold truncate">
                            {contact.user?.firstName
                              ? `${contact.user.firstName} ${contact.user.lastName ?? ''}`.trim()
                              : contact.subject}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{contact.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px]">
                            {contact.subject}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            {/* <div className="border-t p-2">
              <MembersPagination
                pagination={pagination}
                onPageChange={setCurrentPage}
                entityLabel="messages"
              />
            </div> */}
          </div>

          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                <div className="px-4 py-3 border-b border-slate-300 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedContact(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
                    {selectedContact.user?.picture ? (
                      <img
                        src={selectedContact.user.picture}
                        alt={`${selectedContact.user.firstName} ${selectedContact.user.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (selectedContact.user?.firstName?.[0] ?? 'U')
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">
                      {selectedContact.user?.firstName
                        ? `${selectedContact.user.firstName} ${selectedContact.user.lastName ?? ''}`.trim()
                        : selectedContact.subject}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedContact.user?.email ?? 'Guest user'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(selectedContact)}
                        className="text-destructive"
                        disabled={actionLoading === selectedContact._id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <ScrollArea className="flex-1 px-4 py-6 max-h-[calc(100vh-200px)] overflow-y-auto bg-slate-500/10">
                  <div className="flex flex-col gap-4">
                    {conversationMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col max-w-[70%]",
                          message.direction === 'outgoing' ? 'ml-auto items-end' : 'mr-auto items-start'
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2 shadow-sm",
                            message.direction === 'outgoing'
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.body}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                          {format(new Date(message.timestamp), 'PPP p')}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t border-slate-300 p-4 space-y-3">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Subject: {selectedContact.subject}
                    </p>
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || sendingReply}
                    >
                      {sendingReply ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm space-y-4">
                <MessageSquare className="h-10 w-10" />
                <div className="text-center">
                  <p className="font-semibold text-foreground">Select a conversation</p>
                  <p>Choose a message to start responding.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

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
              className="bg-destructive text-white hover:bg-destructive/90"
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

