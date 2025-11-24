import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

import { cn } from '@/lib/utils';

import {
  fetchContactsApi,
  deleteContactApi,
  replyToContactApi,
  type Contact,
} from '@/api/contactsApi';

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
  X,
  MessageSquare,
  Send,
  Search,
  Reply,
  ReplyAll,
  Forward,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/app/rootReducer';

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
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
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
        const response = await fetchContactsApi();
        
        // Simplify data extraction based on your API response structure
        let contactsData: Contact[] = [];
        
        if (Array.isArray(response?.data)) {
          contactsData = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          contactsData = response.data.data;
        } else if (Array.isArray(response?.data?.contacts)) {
          contactsData = response.data.contacts;
        } else if (Array.isArray(response)) {
          contactsData = response;
        }

        setContacts(contactsData);
        
        // Initialize conversation map with initial messages
        const initialConversations: Record<string, ConversationMessage[]> = {};
        contactsData.forEach((contact: Contact) => {
          initialConversations[contact._id] = [
            {
              id: contact._id,
              direction: 'incoming',
              body: contact.message,
              timestamp: contact.createdAt,
            },
          ];
        });
        setConversationMap(initialConversations);
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
      
      // Clear selection if deleting the currently selected contact
      if (selectedContact?._id === contact._id) {
        setSelectedContact(null);
      }
      
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
      await replyToContactApi(selectedContact._id, { response: replyMessage.trim() });
      
      // Add the reply to the conversation
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
    <div className="min-h-screen bg-muted/30 py-6">
      <div className="mx-auto max-w-[1400px] bg-background border border-slate-300 rounded-2xl shadow-sm flex min-h-[700px] overflow-hidden">
        {/* Sidebar with user info */}
        <aside className="w-60 border-r border-slate-300 bg-white/70 dark:bg-background p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Account</p>
              <div className="mt-3 rounded-2xl border border-slate-500 bg-background p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold leading-tight ">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start gap-3 font-semibold"
              >
                <Mail className="h-4 w-4" />
                Inbox
                <Badge variant="default" className='ml-auto'>
                  {filteredContacts.length}
                </Badge>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <section className="flex-1 flex divide-x divide-slate-300">
          {/* Contacts list sidebar */}
          <div className="flex-1 flex flex-col">
            <div className="border-b border-slate-300 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  All Inboxes
                </h3>
                <Badge variant="outline" className="uppercase text-[10px]">
                  {filteredContacts.length} messages
                </Badge>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages, subjects, names, or emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start gap-2 text-xs",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {startDate ? format(startDate, "MMM dd") : "Start"}
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
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start gap-2 text-xs",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {endDate ? format(endDate, "MMM dd") : "End"}
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
              
              {/* Clear filters */}
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 text-xs"
                  onClick={clearDateFilters}
                >
                  <X className="h-3.5 w-3.5" />
                  Clear date filters
                </Button>
              )}
            </div>

            {/* All Inboxes List */}
            <ScrollArea className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)] ">
              <div className="divide-y divide-slate-300">
                {filteredContacts.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold text-foreground mb-2">No messages found</p>
                    <p className="text-sm">
                      {contacts.length === 0 
                        ? 'No contact messages have been received yet.' 
                        : 'Try adjusting your search or filters.'}
                    </p>
                  </div>
                )}
                
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContact?._id === contact._id;
                  const contactDate = formatDate(contact.createdAt);
                  
                  return (
                    <div
                      key={contact._id}
                      className={cn(
                        "p-6 cursor-pointer transition-colors border-l-4 hover:bg-muted/50",
                        isSelected 
                          ? "bg-muted border-l-slate-500" 
                          : "border-l-transparent hover:border-l-muted-foreground/30"
                      )}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs font-semibold overflow-hidden flex-shrink-0">
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
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground truncate">
                                  {contact.user?.firstName
                                    ? `${contact.user.firstName} ${contact.user.lastName ?? ''}`.trim()
                                    : 'Unknown User'}
                                </p>
                                <Badge variant="secondary" className="text-[10px]">
                                  {contact.subject}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {contact.user?.email ?? 'No email provided'}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-foreground mb-3  truncate word-wrap-break-word break-all max-w-[200px]">
                            <span className="truncate">
                              {contact.message}
                            </span>
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {contactDate ? format(contactDate, 'PPP') : 'Unknown date'}
                            </span>
                            <span>
                              {contactDate ? formatDistanceToNow(contactDate, { addSuffix: true }) : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(contact);
                                }}
                                className="text-destructive"
                                disabled={actionLoading === contact._id}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Conversation view - Only show when a contact is selected */}
          {selectedContact && (
            <div className="hidden lg:flex lg:w-[600px] xl:w-[700px] shrink-0 flex-col border-l border-slate-300">
              {/* Conversation header */}
              <div className="border-b border-slate-300 px-6 py-4 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Conversation
                    </p>
                    <h2 className="text-xl font-semibold text-foreground truncate">
                      {selectedContact.subject}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ReplyAll className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Forward className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
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
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {selectedContact.user?.firstName
                        ? `${selectedContact.user.firstName} ${selectedContact.user.lastName ?? ''}`.trim()
                        : selectedContact.subject}
                    </p>
                    <p className="text-xs">
                      Reply-To: {selectedContact.user?.email ?? 'Guest user'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(selectedContact.createdAt), 'PPP p')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-6 py-6">
                <div className="flex flex-col gap-4">
                  {conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        message.direction === 'outgoing' ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-5 py-3 text-sm shadow-sm",
                          message.direction === 'outgoing'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        )}
                      >
                        {message.body}
                      </div>
                      <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {format(new Date(message.timestamp), 'PPP p')}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply area */}
              <div className="border-t border-slate-300 px-6 py-4 space-y-3">
                <Textarea
                  placeholder="Reply to this message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={3}
                  name="response"
                  className="resize-none"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
                  <div>
                    Subject: {selectedContact.subject}
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    
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
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription className="text-sm flex  flex-wrap">
              Are you sure you want to delete the contact message <span className="font-semibold">{selectedContact?.subject}</span>?
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