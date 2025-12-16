import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

import { cn } from '@/lib/utils';

import {
  fetchContactsApi,
  deleteContactApi,
  replyToContactApi,
  fetchContactUserConversationApi,
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
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/app/rootReducer';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/shared/page-head';
import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle } from '@/components/ui/alert';

const ContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
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
  const navigate = useNavigate();
  const [userConversationsLoading, setUserConversationsLoading] = useState(false);
  const [userConversationsError, setUserConversationsError] = useState<string | null>(null);

  const extractContactsFromResponse = (response: any): Contact[] => {
    if (Array.isArray(response?.data?.data)) {
      return response.data.data
    }
    if (Array.isArray(response?.data?.contacts)) {
      return response.data.contacts
    }
    if (Array.isArray(response?.data)) {
      return response.data
    }
    if (Array.isArray(response)) {
      return response
    }
    return []
  }

  const buildConversationMessages = (items: Contact[]): ConversationMessage[] => {
    return items
      .map((item) => ({
        id: `${item._id}-incoming`,
        direction: 'incoming' as const,
        body: item.message,
        timestamp: item.createdAt,
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const loadUserConversation = async (contact: Contact) => {
    setUserConversationsLoading(true)
    setUserConversationsError(null)
    try {
      // Extract user ID from the contact
      const userId = contact.user?._id;
      
      if (!userId) {
        // If no user ID, just show the current contact message
        console.warn('No user ID found for contact:', contact._id);
        const incomingMessages = buildConversationMessages([contact]);
        
        setConversationMap(prev => {
          const existing = prev[contact._id] || []
          const outgoingMessages = existing.filter(message => message.direction === 'outgoing')
          const merged = [...incomingMessages, ...outgoingMessages].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          return {
            ...prev,
            [contact._id]: merged,
          }
        })
        setUserConversationsLoading(false)
        return;
      }
      
      const response = await fetchContactUserConversationApi(userId)
      const conversationContacts = extractContactsFromResponse(response)
      const incomingMessages = buildConversationMessages(conversationContacts.length ? conversationContacts : [contact])

      setConversationMap(prev => {
        const existing = prev[contact._id] || []
        const outgoingMessages = existing.filter(message => message.direction === 'outgoing')
        const merged = [...incomingMessages, ...outgoingMessages].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        return {
          ...prev,
          [contact._id]: merged,
        }
      })
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('contacts.conversation.errorMessage', 'Unable to load full conversation history.')
      setUserConversationsError(message)
      toast.error(message)
    } finally {
      setUserConversationsLoading(false)
    }
  }

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);

      try {
        const response = await fetchContactsApi();
        const contactsData = extractContactsFromResponse(response);

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
        toast.error(err?.response?.data?.message || t('contacts.errors.fetchFailed', 'Failed to load contacts'));
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [t]);

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
      toast.success(t('contacts.messages.deleteSuccess', 'Contact deleted successfully'));
      setDeleteDialogOpen(false);
      
      // Clear selection if deleting the currently selected contact
      if (selectedContact?._id === contact._id) {
        setSelectedContact(null);
      }
      
      setContacts((prev) => prev.filter((c) => c._id !== contact._id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('contacts.errors.deleteFailed', 'Failed to delete contact'));
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
    // Clear reply message when selecting a different contact
    setReplyMessage('');
    loadUserConversation(contact);
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
      toast.success(t('contacts.messages.replySuccess', 'Reply sent successfully'));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('contacts.errors.replyFailed', 'Failed to send reply'));
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
      <div className='flex items-start gap-4'>
        <Button
          variant={'outline'}
          size={'icon'}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='w-4 h-4'/>
        </Button>
        <PageHead  
          title={t('contacts.title', 'Contacts')}
          description={t('contacts.description', 'Manage your inbox.')}
          icon={MessageSquare}
          total={0}
        />
      </div>
      <div className="mx-auto max-w-full bg-background border border-slate-300 rounded-2xl shadow-sm flex min-h-[700px] overflow-hidden">
        {/* Sidebar with user info */}
        <aside className="w-60 border-r border-slate-300 bg-white/70 dark:bg-background p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                {t('contacts.sidebar.account', 'Account')}
              </p>
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
                {t('contacts.sidebar.inbox', 'Inbox')}
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
                  {t('contacts.sidebar.allInboxes', 'All Inboxes')}
                </h3>
                <Badge variant="outline" className="uppercase text-[10px]">
                  {t('contacts.messagesCount', '{count} messages', { count: filteredContacts.length })}
                </Badge>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('contacts.search.placeholder', 'Search messages, subjects, names, or emails...')}
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
                        {startDate ? format(startDate, "MMM dd") : t('contacts.filters.start', 'Start')}
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
                        {endDate ? format(endDate, "MMM dd") : t('contacts.filters.end', 'End')}
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
                  {t('contacts.filters.clear', 'Clear date filters')}
                </Button>
              )}
            </div>

            {/* All Inboxes List */}
            <ScrollArea className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)] ">
              <div className="divide-y divide-slate-300">
                {filteredContacts.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold text-foreground mb-2">
                      {t('contacts.emptyState.title', 'No messages found')}
                    </p>
                    <p className="text-sm">
                      {contacts.length === 0 
                        ? t('contacts.emptyState.noMessages', 'No contact messages have been received yet.') 
                        : t('contacts.emptyState.noResults', 'Try adjusting your search or filters.')}
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
                                    : t('contacts.unknownUser', 'Unknown User')}
                                </p>
                                <Badge variant="secondary" className="text-[10px]">
                                  {contact.subject}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {contact.user?.email ?? t('contacts.noEmail', 'No email provided')}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-foreground mb-3 line-clamp-2 break-words">
                            {contact.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {contactDate ? format(contactDate, 'PPP') : t('contacts.unknownDate', 'Unknown date')}
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
                                {t('contacts.actions.deleteMessage', 'Delete message')}
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
                      {t('contacts.conversation.title', 'Conversation')}
                    </p>
                    <h2 className="text-xl font-semibold text-foreground truncate">
                      {selectedContact.subject}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* <Button variant="ghost" size="icon">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ReplyAll className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Forward className="h-4 w-4" />
                    </Button> */}
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
                          {t('contacts.actions.deleteConversation', 'Delete conversation')}
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
                      {t('contacts.conversation.replyTo', 'Reply-To')}: {selectedContact.user?.email ?? t('contacts.guestUser', 'Guest user')}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(selectedContact.createdAt), 'PPP p')}
                  </span>
                </div>
                {userConversationsLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('contacts.conversation.loading', 'Loading conversation history...')}
                  </div>
                )}
                {userConversationsError && (
                  <Alert variant="destructive">
                    <AlertTitle>{t('contacts.conversation.errorTitle', 'Conversation unavailable')}</AlertTitle>
                    <p className="text-sm">{userConversationsError}</p>
                  </Alert>
                )}
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
                          "rounded-2xl px-5 py-3 text-sm shadow-sm whitespace-pre-wrap break-words",
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
                  placeholder={t('contacts.reply.placeholder', 'Reply to this message')}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={3}
                  name="response"
                  className="resize-none w-full whitespace-pre-wrap break-words min-h-[80px]"
                />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
                  <div>
                    {t('contacts.reply.subject', 'Subject')}: {selectedContact.subject}
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || sendingReply}
                    >
                      {sendingReply ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {t('contacts.reply.sending', 'Sending...')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t('contacts.reply.send', 'Send')}
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
            <AlertDialogTitle>
              {t('contacts.deleteDialog.title', 'Delete Contact')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm flex flex-wrap">
              {t('contacts.deleteDialog.description', 'Are you sure you want to delete the contact message {subject}? This action cannot be undone.', {
                subject: <span className="font-semibold">{selectedContact?.subject}</span>
              })}
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
              {t('contacts.actions.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedContact && handleDelete(selectedContact)}
              disabled={actionLoading === selectedContact?._id}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {actionLoading === selectedContact?._id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('contacts.actions.deleting', 'Deleting...')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('contacts.actions.delete', 'Delete')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface ConversationMessage {
  id: string;
  direction: 'incoming' | 'outgoing';
  body: string;
  timestamp: string;
}

export default ContactsPage;