import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/app/rootReducer";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Icons
import {
  MoreVertical,
  Eye,
  Trash2,
  UserX,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  UserCog,
  Plus,
  Shield,
  Crown,
  Grid3x3,
  List,
  Search,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { fetchUsersRequest } from "@/store/features/users/users.actions";
import type { AppDispatch } from "@/store/app/store";
import type { User } from "@/types/usersType";
import PageHead from "@/components/shared/page-head";
import { UsersFilters } from "@/components/partials/usersComponents/UsersFilters";
import {
  filterUsers,
  sortUsers,
  type UsersFilters as UsersFiltersType,
  type UserSortField,
  type UserSortDirection,
} from "@/lib/users-utils";
import { PROFILE_PAGE } from "@/constants/routerConstants";
import { formatDate } from "@/lib/helperFunctions";
import AddAccountDialog from "@/components/partials/usersComponents/AddAccountDialog";
import { MembersPagination } from "@/components/partials/membersComponents/MembersPagination";
import { createUserApi, updateAccoutStatusApi } from "@/api/usersApi";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getLayoutPreferences, setLayoutPreferences } from "@/services/localStorage";

type LayoutType = 'grid' | 'list';

export const ComptesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    users,
    isLoading: loading,
    error,
    usersCount,
    pagination,
  } = useSelector((state: RootState) => state.users) || {};

  const [filters, setFilters] = useState<UsersFiltersType>({
    search: "",
    status: "all",
    registrationStatus: "all",
    gender: "all",
    userType: "all",
  });

  const [layout, setLayout] = useState<LayoutType>(getLayoutPreferences().accountsLayout);
  const setLayoutFunc = (layout: LayoutType) => {
    setLayout(layout)
    setLayoutPreferences({
      ...getLayoutPreferences(),
      accountsLayout: layout
    })
  }


  const [sort, setSort] = useState<{
    field: UserSortField;
    direction: UserSortDirection;
  }>({
    field: "createdAt",
    direction: "desc",
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [addAccountDialogOpen, setAddAccountDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState<"all" | "organizer" | "admin">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on selected role
  const filteredUsers = useMemo(() => {
    const allUsers = users || [];
    
    if (role === "admin") {
      return allUsers.filter(user => user.role.name.toLowerCase() === "admin");
    } else if (role === "organizer") {
      return allUsers.filter(user => user.role.name.toLowerCase() === "organizer");
    } else {
      // "all" - return both admins and organizers
      return allUsers.filter(user => 
        user.role.name.toLowerCase() === "admin" || 
        user.role.name.toLowerCase() === "organizer"
      );
    }
  }, [users, role]);

  // Sync role filter with userType select
  useEffect(() => {
    const mappedRole: "all" | "organizer" | "admin" =
        filters.userType === "organizer"
        ? "organizer"
        : filters.userType === "admin"
        ? "admin"
        : "all";

    setRole((prev) => {
      if (prev !== mappedRole) {
        setCurrentPage(1);
        return mappedRole;
      }
      return prev;
    });
  }, [filters.userType]);

  // Fetch users when page/role changes
  useEffect(() => {
    dispatch(fetchUsersRequest(currentPage, PAGE_SIZE, role));
  }, [dispatch, currentPage, role]);

  useEffect(() => {
    if (
      pagination &&
      pagination.totalPages > 0 &&
      currentPage > pagination.totalPages
    ) {
      setCurrentPage(pagination.totalPages);
    }
  }, [pagination, currentPage]);

  // Filter and sort users
  const processedUsers = useMemo(() => {
    const filtered = filterUsers(filteredUsers, filters);
    const sorted = sortUsers(filtered, sort.field, sort.direction);
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return sorted.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phoneNumber?.toLowerCase().includes(term) ||
        user.role.name.toLowerCase().includes(term)
      );
    }
    
    return sorted;
  }, [filteredUsers, filters, sort.field, sort.direction, searchTerm]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const getUserRoleIcon = (userType: string) => {
    switch (userType.toLowerCase()) {
      case "admin":
        return <Shield className="w-3 h-3" />;
      case "organizer":
        return <Crown className="w-3 h-3" />;
      default:
        return <UserCog className="w-3 h-3" />;
    }
  };

  const getUserRoleColor = (userType: string) => {
    switch (userType.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "organizer":
        return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  const handleViewProfile = (user: User) => {
    navigate(PROFILE_PAGE(user._id?.toString()));
  };

  const handleToggleStatus = async (user: User) => {
    const accountId = user._id.toString();
    const accountStatus = user.isActive;

    setActionLoading(user._id?.toString());
    try {
      const response = await updateAccoutStatusApi(accountId,!accountStatus);
      if (response.status === 200) {
        toast.success(
          t(
            `accounts.messages.${
              !user.isActive ? "activateSuccess" : "deactivateSuccess"
            }`,
            `User ${!user.isActive ? "activated" : "deactivated"} successfully`
          )
        );
        dispatch(fetchUsersRequest(currentPage, PAGE_SIZE, role));
      } else {
        toast.error(
          t(
            `accounts.messages.${
              !user.isActive ? "activateError" : "deactivateError"
            }`,
            `User ${!user.isActive ? "activated" : "deactivated"} failed`
          )
        );
      }
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("accounts.messages.activateError", "Failed to update user status")
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: User) => {
    setActionLoading(user._id?.toString());
    try {
      // TODO: Implement delete API call
      toast.success(
        t("accounts.messages.deleteSuccess", "User deleted successfully")
      );
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      dispatch(fetchUsersRequest(currentPage, PAGE_SIZE, role));
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("accounts.messages.deleteError", "Failed to delete user")
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSort = (field: UserSortField) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (field: UserSortField) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const handleCreateAccount = async (data: any) => {
    setCreateLoading(true);
    try {
      const response = await createUserApi(data);
      if (response?.status === 200 || response?.status === 201) {
        toast.success(
          t("accounts.messages.createSuccess", "Account created successfully")
        );
        setAddAccountDialogOpen(false);
        setCurrentPage(1);
        dispatch(fetchUsersRequest(1, PAGE_SIZE, role));
      } else {
        toast.error(
          response?.data?.message ||
            t("accounts.messages.createError", "Failed to create account")
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("accounts.messages.createError", "Failed to create account")
      );
      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle dropdown actions with event propagation stopped
  const handleDropdownAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Grid Card Component
  const GridCard = ({ user }: { user: User }) => {
    const isActive = user.isActive;
    const statusColor = isActive ? "border-l-green-500" : "border-l-red-500";
    const statusBgColor = isActive ? "hover:border-l-green-600" : "hover:border-l-red-600";
    const cardBgColor = isActive 
      ? "bg-gradient-to-br from-white to-green-50/30" 
      : "bg-gradient-to-br from-white to-red-50/30";
    const shadowColor = isActive 
      ? "hover:shadow-lg hover:shadow-green-100/50" 
      : "hover:shadow-lg hover:shadow-red-100/50";

    return (
      <Card
        key={user._id.$oid}
        onClick={() => handleViewProfile(user)}
        className={cn(
          "overflow-hidden transition-all duration-300 cursor-pointer border-l-4",
          statusColor,
          statusBgColor,
          cardBgColor,
          shadowColor,
          "transform hover:-translate-y-1",
          "relative group"
        )}
      >
        {/* Status indicator dot */}
        {/* <div className={cn(
          "absolute top-3 left-3 w-3 h-3 rounded-full",
          isActive ? "bg-green-500" : "bg-red-500",
          "animate-pulse"
        )} /> */}

        <CardHeader className="pb-3 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-gray-200 group-hover:border-blue-400 transition-colors duration-300">
                  <AvatarImage
                    src={user.picture}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  <AvatarFallback className={cn(
                    "text-sm text-white",
                    isActive 
                      ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                      : "bg-gradient-to-br from-red-500 to-rose-600"
                  )}>
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online/Offline indicator ring */}
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
                  isActive ? "bg-green-500" : "bg-red-500"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-blue-600 transition-colors duration-300">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <Badge
                    className={cn(
                      "text-xs font-medium transition-colors duration-300",
                      isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                    )}
                  >
                    {isActive
                      ? t("accounts.status.active", "Active")
                      : t("accounts.status.inactive", "Inactive")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs flex items-center gap-1 capitalize ${getUserRoleColor(user.role.name)} border-gray-200`}
                  >
                    {getUserRoleIcon(user.role.name)}
                    {user.role.name}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem 
                  onClick={(e) => handleDropdownAction(e, () => handleViewProfile(user))}
                  className="cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t("accounts.actions.viewProfile", "View Profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => handleDropdownAction(e, () => handleToggleStatus(user))}
                  disabled={actionLoading === user._id?.toString()}
                  className="cursor-pointer"
                >
                  {isActive ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      {t("accounts.actions.deactivate", "Deactivate")}
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      {t("accounts.actions.activate", "Activate")}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => handleDropdownAction(e, () => openDeleteDialog(user))}
                  className="text-destructive cursor-pointer"
                  disabled={actionLoading === user._id?.toString()}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("accounts.actions.delete", "Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm group/email">
              <Mail className="w-4 h-4 text-muted-foreground group-hover/email:text-blue-500 transition-colors duration-300" />
              <span className="text-muted-foreground truncate group-hover/email:text-gray-900 transition-colors duration-300">
                {user.email || t("accounts.notAvailable", "N/A")}
              </span>
            </div>

            {user.phoneNumber && (
              <div className="flex items-center space-x-2 text-sm group/phone">
                <Phone className="w-4 h-4 text-muted-foreground group-hover/phone:text-blue-500 transition-colors duration-300" />
                <span className="text-muted-foreground group-hover/phone:text-gray-900 transition-colors duration-300">
                  {user.phoneNumber}
                </span>
              </div>
            )}

            {(user.city || user.country) && (
              <div className="flex items-center space-x-2 text-sm group/location">
                <MapPin className="w-4 h-4 text-muted-foreground group-hover/location:text-blue-500 transition-colors duration-300" />
                <span className="text-muted-foreground group-hover/location:text-gray-900 transition-colors duration-300">
                  {[user.city, user.country].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            {user.company?.name && (
              <div className="flex items-center space-x-2 text-sm group/company">
                <Briefcase className="w-4 h-4 text-muted-foreground group-hover/company:text-blue-500 transition-colors duration-300" />
                <span className="text-muted-foreground truncate group-hover/company:text-gray-900 transition-colors duration-300">
                  {user.company.name}
                </span>
              </div>
            )}

            {user.createdAt && (
              <div className="flex items-center space-x-2 text-sm group/date">
                <Calendar className="w-4 h-4 text-muted-foreground group-hover/date:text-blue-500 transition-colors duration-300" />
                <span className="text-muted-foreground group-hover/date:text-gray-900 transition-colors duration-300">
                  {t("accounts.fields.joined", "Joined")}{" "}
                  {formatDate(user.createdAt)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-gray-200/50 pt-3">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                user.registrationCompleted ? "bg-green-500" : "bg-amber-500"
              )} />
              <span className="text-xs text-muted-foreground">
                {t("accounts.fields.registration", "Registration")}{" "}
                {user.registrationCompleted
                  ? t("accounts.registration.completed", "Completed")
                  : t("accounts.registration.pending", "Pending")}
              </span>
            </div>
            
            {user.gender && (
              <div className="flex items-center space-x-1">
                {user.gender.toLowerCase() === 'male' ? (
                  <span className="text-xs text-blue-600">♂</span>
                ) : user.gender.toLowerCase() === 'female' ? (
                  <span className="text-xs text-pink-600">♀</span>
                ) : null}
                <span className="text-xs text-muted-foreground capitalize">
                  {user.gender}
                </span>
              </div>
            )}
          </div>
        </CardFooter>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/2 group-hover:to-blue-500/0 transition-all duration-300 pointer-events-none" />
      </Card>
    );
  };

  // List Row Component
  const ListRow = ({ user }: { user: User }) => {
    const isActive = user.isActive;
    
    return (
      <TableRow 
        key={user._id.$oid}
        className={cn(
          "cursor-pointer hover:bg-muted/50 transition-colors duration-200",
          isActive ? "hover:bg-green-50/50" : "hover:bg-red-50/50"
        )}
        onClick={() => handleViewProfile(user)}
      >
        <TableCell className="py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.picture} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className={cn(
                  "text-sm text-white",
                  isActive 
                    ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                    : "bg-gradient-to-br from-red-500 to-rose-600"
                )}>
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                isActive ? "bg-green-500" : "bg-red-500"
              )} />
            </div>
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email || t("accounts.notAvailable", "N/A")}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-4">
          <Badge
            variant="outline"
            className={`text-xs ${getUserRoleColor(user.role.name)}`}
          >
            {getUserRoleIcon(user.role.name)}
            <span className="ml-1">{user.role.name}</span>
          </Badge>
        </TableCell>
        <TableCell className="py-4">
          <Badge
            className={cn(
              isActive
                ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
            )}
          >
            {isActive
              ? t("accounts.status.active", "Active")
              : t("accounts.status.inactive", "Inactive")}
          </Badge>
        </TableCell>
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            {user.registrationCompleted ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-green-700">
                  {t("accounts.registration.completed", "Completed")}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-amber-700">
                  {t("accounts.registration.pending", "Pending")}
                </span>
              </>
            )}
          </div>
        </TableCell>
        <TableCell className="py-4">
          {formatDate(user.createdAt)}
        </TableCell>
        <TableCell className="py-4 text-right">
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
                onClick={(e) => handleDropdownAction(e, () => handleViewProfile(user))}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t("accounts.actions.viewProfile", "View Profile")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => handleDropdownAction(e, () => handleToggleStatus(user))}
                disabled={actionLoading === user._id?.toString()}
                className="cursor-pointer"
              >
                {isActive ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    {t("accounts.actions.deactivate", "Deactivate")}
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    {t("accounts.actions.activate", "Activate")}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => handleDropdownAction(e, () => openDeleteDialog(user))}
                className="text-destructive cursor-pointer"
                disabled={actionLoading === user._id?.toString()}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("accounts.actions.delete", "Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  // Quick search handler
  const handleQuickSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setCurrentPage(1);
    }
  };

  // Loading state
  if (loading && (!users || users.length === 0)) {
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

  const totalUsers = processedUsers.length;

  const handlePageChange = (page: number) => {
    if (!pagination) return;
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
  };

  // Stats calculation
  const adminCount = filteredUsers.filter(user => user.role.name.toLowerCase() === "admin").length;
  const organizerCount = filteredUsers.filter(user => user.role.name.toLowerCase() === "organizer").length;
  const activeCount = filteredUsers.filter(user => user.isActive).length;
  const inactiveCount = filteredUsers.filter(user => !user.isActive).length;

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHead
          title={t("accounts.title", "Admin & Organizer Accounts")}
          icon={UserCog}
          description={t("accounts.description", "Manage administrators and event organizers")}
          total={totalUsers}
        />
        <div className="flex items-center gap-3">
          {/* Layout Toggle */}
          <Tabs 
            value={layout} 
            onValueChange={(value) => setLayoutFunc(value as LayoutType)}
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
          
          <Button onClick={() => setAddAccountDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("accounts.addAccount", "Add Account")}
          </Button>
        </div>
      </div>


      {/* Filters */}
      <UsersFilters filters={filters} onFiltersChange={setFilters} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCog className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizers</p>
                <p className="text-2xl font-bold text-gray-900">{organizerCount}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sort Options */}
      <Card className="border-slate-200">
        <CardContent className="">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <span className="text-sm font-medium text-muted-foreground">
                {t("accounts.sort.by", "Sort by:")}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("firstName")}
                  className="gap-2"
                >
                  {t("accounts.sort.name", "Name")} {getSortIcon("firstName")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("email")}
                  className="gap-2"
                >
                  {t("accounts.sort.email", "Email")} {getSortIcon("email")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("createdAt")}
                  className="gap-2"
                >
                  {t("accounts.sort.joinDate", "Join Date")}{" "}
                  {getSortIcon("createdAt")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("isActive")}
                  className="gap-2"
                >
                  {t("accounts.sort.status", "Status")} {getSortIcon("isActive")}
                </Button>
              </div>
            </div>
            
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-sm"
              >
                {t("accounts.clearSearch", "Clear search")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-2">{error}</div>
            <Button
              onClick={() =>
                dispatch(fetchUsersRequest(currentPage, PAGE_SIZE, role))
              }
            >
              {t("accounts.actions.retry", "Retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Users Display - Grid or List */}
      {processedUsers.length > 0 ? (
        <>
          {layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {processedUsers.map((user) => (
                <GridCard key={user._id.$oid} user={user} />
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 p-0 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="sticky top-0 py-2 z-10 bg-white">
                    <TableRow className="py-2">
                      <TableHead>{t("accounts.list.name", "Name")}</TableHead>
                      <TableHead>{t("accounts.list.role", "Role")}</TableHead>
                      <TableHead>{t("accounts.list.status", "Status")}</TableHead>
                      <TableHead>{t("accounts.list.registration", "Registration")}</TableHead>
                      <TableHead>{t("accounts.list.joinDate", "Join Date")}</TableHead>
                      <TableHead className="text-right">{t("accounts.list.actions", "Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="overflow-y-auto divide-gray-200">
                    {processedUsers.map((user) => (
                      <ListRow key={user._id.$oid} user={user} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Empty State */
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-10 w-10 text-blue-600" />
                    <Crown className="h-8 w-8 text-purple-600 relative -left-4" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-xl mb-3">
              {t("accounts.emptyState.title", "No Admins or Organizers Found")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || filters.search || filters.status !== "all" || 
              filters.registrationStatus !== "all" || filters.gender !== "all" || 
              filters.userType !== "all"
                ? t(
                    "accounts.emptyState.noResults",
                    "No accounts match your search criteria. Try adjusting your filters or search term."
                  )
                : t(
                    "accounts.emptyState.noUsers",
                    "No admin or organizer accounts have been created yet. Create your first account to get started."
                  )}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {(searchTerm || filters.search || filters.status !== "all" || 
                filters.registrationStatus !== "all" || filters.gender !== "all" || 
                filters.userType !== "all") ? (
                <>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                    >
                      {t("accounts.clearSearch", "Clear search")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({
                        search: "",
                        status: "all",
                        registrationStatus: "all",
                        gender: "all",
                        userType: "all",
                      });
                    }}
                  >
                    {t("accounts.actions.clearFilters", "Clear All Filters")}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setAddAccountDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("accounts.addFirstAccount", "Create First Account")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <MembersPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          entityLabel="accounts"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("accounts.deleteDialog.title", "Delete User")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "accounts.deleteDialog.description",
                "Are you sure you want to delete {name}? This action cannot be undone.",
                { name: `${selectedUser?.firstName} ${selectedUser?.lastName}` }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={actionLoading === selectedUser?._id?.toString()}
            >
              {t("accounts.deleteDialog.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleDelete(selectedUser)}
              disabled={actionLoading === selectedUser?._id?.toString()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === selectedUser?._id?.toString() ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("accounts.deleteDialog.deleting", "Deleting...")}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("accounts.deleteDialog.delete", "Delete")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Account Dialog */}
      <AddAccountDialog
        isOpen={addAccountDialogOpen}
        onClose={() => setAddAccountDialogOpen(false)}
        onSave={handleCreateAccount}
        isLoading={createLoading}
      />
    </div>
  );
};

export default ComptesPage;