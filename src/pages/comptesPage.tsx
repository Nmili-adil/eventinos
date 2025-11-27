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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Briefcase,
  UserCog,
  Plus,
  Shield,
  Crown,
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
    return sorted;
  }, [filteredUsers, filters, sort.field, sort.direction]);

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
        return "bg-red-100 text-red-800 border-red-200";
      case "organizer":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewProfile = (user: User) => {
    navigate(PROFILE_PAGE(user._id?.toString()));
  };

  const handleToggleStatus = async (user: User) => {
    const accountId = user._id.toString();
    const accountStatus = user.isActive

    setActionLoading(user._id?.toString());
    try {
     const response = await updateAccoutStatusApi(accountId,!accountStatus)
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
          `User ${!user.isActive ? "activated" : "deactivated"} faild`
        )
      )
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

  // Loading state
  if (loading && (!users || users.length === 0)) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHead
          title={t("accounts.title", "Admin & Organizer Accounts")}
          icon={UserCog}
          description={t("accounts.description", "Manage administrators and event organizers")}
          total={totalUsers}
        />
        <Button onClick={() => setAddAccountDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t("accounts.addAccount", "Add Account")}
        </Button>
      </div>

      {/* Filters */}
      <UsersFilters filters={filters} onFiltersChange={setFilters} />

      {/* Role Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredUsers.filter(user => user.role.name.toLocaleLowerCase() === "admin".toLowerCase()).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Organizers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredUsers.filter(user => user.role.name.toLocaleLowerCase() === "organizer".toLocaleLowerCase()).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sort Options */}
      <Card>
        <CardContent className="pt-6">
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
                onClick={() => handleSort("user")}
                className="gap-2"
              >
                {t("accounts.sort.type", "Type")} {getSortIcon("user")}
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
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
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

      {/* Users Grid */}
      {processedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedUsers.map((user) => (
            <Card
              key={user._id.$oid}
              onClick={() => handleViewProfile(user)}
              className="overflow-hidden hover:shadow-lg transition-shadow justify-between cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="w-12 h-12 border-2 border-gray-200">
                      <AvatarImage
                        src={user.picture}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-tight truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.isActive
                            ? t("accounts.status.active", "Active")
                            : t("accounts.status.inactive", "Inactive")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs flex items-center gap-1 capitalize ${getUserRoleColor(user.role.name)}`}
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
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-50">
                      <DropdownMenuItem 
                        onClick={(e) => handleDropdownAction(e, () => handleViewProfile(user))}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t("accounts.actions.viewProfile", "View Profile")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleDropdownAction(e, () => handleToggleStatus(user))}
                        disabled={actionLoading === user._id?.toString()}
                      >
                        {user.isActive ? (
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
                        className="text-destructive"
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
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {user.email || t("accounts.notAvailable", "N/A")}
                    </span>
                  </div>

                  {user.phoneNumber && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {user.phoneNumber}
                      </span>
                    </div>
                  )}

                  {(user.city || user.country) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {[user.city, user.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {user.company?.name && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {user.company.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("accounts.fields.joined", "Joined")}{" "}
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {t("accounts.fields.registration", "Registration")}{" "}
                    {user.registrationCompleted
                      ? t("accounts.registration.completed", "Completed")
                      : t("accounts.registration.pending", "Pending")}
                  </span>
                  {user.gender && <span className="capitalize">{user.gender}</span>}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Shield className="h-12 w-12 text-muted-foreground" />
                <Crown className="h-8 w-8 text-muted-foreground absolute -top-2 -right-2" />
              </div>
            </div>
            <h3 className="font-semibold">
              {t("accounts.emptyState.title", "No Admins or Organizers Found")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filters.search ||
              filters.status !== "all" ||
              filters.registrationStatus !== "all" ||
              filters.gender !== "all" ||
              filters.userType !== "all"
                ? t(
                    "accounts.emptyState.noResults",
                    "No admins or organizers match your search criteria."
                  )
                : t(
                    "accounts.emptyState.noUsers",
                    "No admin or organizer accounts have been created yet."
                  )}
            </p>
            {(filters.search ||
              filters.status !== "all" ||
              filters.registrationStatus !== "all" ||
              filters.gender !== "all" ||
              filters.userType !== "all") && (
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    status: "all",
                    registrationStatus: "all",
                    gender: "all",
                    userType: "all",
                  })
                }
              >
                {t("accounts.actions.clearFilters", "Clear Filters")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <MembersPagination
        pagination={pagination || null}
        onPageChange={handlePageChange}
        entityLabel="users"
      />

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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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