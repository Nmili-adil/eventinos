import { useState, useEffect } from "react";
import CategoriesTable from "@/components/partials/categoriesComponent/categorieTable";
import BadgesTable from "@/components/partials/badgesComponent/badgesTable";
import PageHead from "@/components/shared/page-head";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { RootState } from "@/store/app/rootReducer";
import type { AppDispatch } from "@/store/app/store";
import { 
  fetchBadgesRequest,
  updateBadgeRequest,
  createBadgeRequest,
  deleteBadgeRequest
} from "@/store/features/badges/badges.actions";
import { 
  fetchCategoriesRequest,
  updateCategoryRequest,
  createCategoryRequest,
  deleteCategoryRequest
} from "@/store/features/categories/categories.actions";
import { SlidersHorizontal, Plus, FolderOpen, Award, Folder, Sparkles, Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import CategoryEditDialog from "@/components/partials/categoriesComponent/CategoryEditDialog";
import CategoryAddDialog from "@/components/partials/categoriesComponent/CategoryAddDialog";
import BadgeEditDialog from "@/components/partials/badgesComponent/BadgeEditDialog";
import BadgeAddDialog from "@/components/partials/badgesComponent/BadgeAddDialog";
import RolesTable from "@/components/partials/rolesComponent/RolesTable";
import RoleAddDialog from "@/components/partials/rolesComponent/RoleAddDialog";
import RoleEditDialog from "@/components/partials/rolesComponent/RoleEditDialog";
import { 
  fetchRolesRequest,
  createRoleRequest,
  updateRoleRequest,
  deleteRoleRequest
} from "@/store/features/roles/roles.actions";

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

interface Badge {
  _id: string;
  name: string;
  description: string;
  design: string;
  image: string;
}

type SettingsView = 'categories' | 'badges' | 'roles';

const SettingsPage = () => {
  const [activeView, setActiveView] = useState<SettingsView>('categories');
  const {
    categories,
    isLoading: categoriesLoading,
    pagination: categoriesPagination,
  } = useSelector((state: RootState) => state.categories);
  const {
    badges,
    isLoading: badgesLoading,
    pagination: badgesPagination,
  } = useSelector((state: RootState) => state.badges);
  const {
    roles,
    isLoading: rolesLoading,
  } = useSelector((state: RootState) => state.roles);
  
  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [badgeData, setBadgeData] = useState<Badge[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [currentCategoriesPage, setCurrentCategoriesPage] = useState(1);
  const [currentBadgesPage, setCurrentBadgesPage] = useState(1);

  // Dialog states
  const [categoryEditDialogOpen, setCategoryEditDialogOpen] = useState(false);
  const [categoryAddDialogOpen, setCategoryAddDialogOpen] = useState(false);
  const [badgeEditDialogOpen, setBadgeEditDialogOpen] = useState(false);
  const [badgeAddDialogOpen, setBadgeAddDialogOpen] = useState(false);
  const [roleEditDialogOpen, setRoleEditDialogOpen] = useState(false);
  const [roleAddDialogOpen, setRoleAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
    dispatch(fetchBadgesRequest());
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0) {
      setCategoryData(categories);
    }
    if (badges.length > 0) {
      setBadgeData(badges);
    }
    if (roles.length > 0) {
      setRoleData(roles);
    }
  }, [categories, badges, roles]);

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryEditDialogOpen(true);
  };

  const handleSaveCategory = async (categoryId: string, data: Partial<Category>) => {
    setActionLoading(categoryId);
    try {
      await dispatch(updateCategoryRequest(categoryId, data));
      toast.success('Category updated successfully');
      setCategoryEditDialogOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update category');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCategory = async (data: any) => {
    setActionLoading('create-category');
    try {
      await dispatch(createCategoryRequest(data));
      toast.success('Category created successfully');
      setCategoryAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create category');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await dispatch(deleteCategoryRequest(category._id));
      toast.success('Category deleted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete category');
    }
  };

  const handleEditBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setBadgeEditDialogOpen(true);
  };

  const handleSaveBadge = async (badgeId: string, data: Partial<Badge>) => {
    setActionLoading(badgeId);
    try {
      await dispatch(updateBadgeRequest(badgeId, data));
      toast.success('Badge updated successfully');
      setBadgeEditDialogOpen(false);
      setSelectedBadge(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update badge');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBadge = async (data: any) => {
    setActionLoading('create-badge');
    try {
      await dispatch(createBadgeRequest(data));
      toast.success('Badge created successfully');
      setBadgeAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create badge');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBadge = async (badge: Badge) => {
    try {
      await dispatch(deleteBadgeRequest(badge._id));
      toast.success('Badge deleted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete badge');
    }
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setRoleEditDialogOpen(true);
  };

  const handleSaveRole = async (roleId: string, data: any) => {
    setActionLoading(roleId);
    try {
      await dispatch(updateRoleRequest(roleId, data));
      toast.success('Role updated successfully');
      setRoleEditDialogOpen(false);
      setSelectedRole(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateRole = async (data: any) => {
    setActionLoading('create-role');
    try {
      await dispatch(createRoleRequest(data));
      toast.success('Role created successfully');
      setRoleAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRole = async (role: any) => {
    try {
      await dispatch(deleteRoleRequest(role._id));
      toast.success('Role deleted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete role');
    }
  };

  const handleCategoriesPageChange = (page: number) => {
    setCurrentCategoriesPage(page);
  };

  const handleBadgesPageChange = (page: number) => {
    setCurrentBadgesPage(page);
  };

  const CategoriesEmptyState = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <FolderOpen className="h-16 w-16 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">No categories found</CardTitle>
        <CardDescription>
          Get started by creating your first category to organize your content.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={() => setCategoryAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </CardContent>
    </Card>
  );

  const BadgesEmptyState = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Award className="h-16 w-16 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">No badges found</CardTitle>
        <CardDescription>
          Start by creating your first badge to reward your users.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={() => setBadgeAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Badge
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <PageHead
          title="Settings"
          icon={SlidersHorizontal}
          description="Manage your categories and badges"
        />
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1 p-2">
                <Button
                  variant={activeView === 'categories' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('categories')}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Categories
                </Button>
                <Button
                  variant={activeView === 'badges' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('badges')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Badges
                </Button>
                <Button
                  variant={activeView === 'roles' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('roles')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Roles
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
                {/* Main Content */}
                <main className="flex-1 min-w-0">
          {activeView === 'categories' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Categories</h2>
                  <p className="text-muted-foreground">
                    Organize your content with categories
                  </p>
                </div>
                <Button onClick={() => setCategoryAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              {categoriesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : categoryData.length > 0 ? (
                <CategoriesTable
                  data={categoryData}
                  pagination={categoriesPagination}
                  onPageChange={handleCategoriesPageChange}
                  onDelete={handleDeleteCategory}
                  onEdit={handleEditCategory}
                />
              ) : (
                <CategoriesEmptyState />
              )}
            </div>
          ) : activeView === 'badges' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Badges</h2>
                  <p className="text-muted-foreground">
                    Reward your users with badges
                  </p>
                </div>
                <Button onClick={() => setBadgeAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Badge
                </Button>
              </div>

              {badgesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : badgeData.length > 0 ? (
                <BadgesTable
                  data={badgeData}
                  pagination={badgesPagination}
                  onPageChange={handleBadgesPageChange}
                  onDelete={handleDeleteBadge}
                  onEdit={handleEditBadge}
                />
              ) : (
                <BadgesEmptyState />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Roles</h2>
                  <p className="text-muted-foreground">
                    Manage user roles and their permissions
                  </p>
                </div>
                <Button onClick={() => setRoleAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>

              {rolesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : roleData.length > 0 ? (
                <RolesTable
                  data={roleData}
                  onDelete={handleDeleteRole}
                  onEdit={handleEditRole}
                />
              ) : (
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Shield className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl">No roles found</CardTitle>
                    <CardDescription>
                      Get started by creating your first role to manage user permissions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button onClick={() => setRoleAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Category Dialogs */}
      <CategoryEditDialog
        category={selectedCategory}
        isOpen={categoryEditDialogOpen}
        onClose={() => {
          setCategoryEditDialogOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleSaveCategory}
        isLoading={actionLoading === selectedCategory?._id}
      />

      <CategoryAddDialog
        isOpen={categoryAddDialogOpen}
        onClose={() => setCategoryAddDialogOpen(false)}
        onSave={handleCreateCategory}
        isLoading={actionLoading === 'create-category'}
      />

      {/* Badge Dialogs */}
      <BadgeEditDialog
        badge={selectedBadge}
        isOpen={badgeEditDialogOpen}
        onClose={() => {
          setBadgeEditDialogOpen(false);
          setSelectedBadge(null);
        }}
        onSave={handleSaveBadge}
        isLoading={actionLoading === selectedBadge?._id}
      />

      <BadgeAddDialog
        isOpen={badgeAddDialogOpen}
        onClose={() => setBadgeAddDialogOpen(false)}
        onSave={handleCreateBadge}
        isLoading={actionLoading === 'create-badge'}
      />

      {/* Role Dialogs */}
      <RoleEditDialog
        role={selectedRole}
        isOpen={roleEditDialogOpen}
        onClose={() => {
          setRoleEditDialogOpen(false);
          setSelectedRole(null);
        }}
        onSave={handleSaveRole}
        isLoading={actionLoading === selectedRole?._id}
      />

      <RoleAddDialog
        isOpen={roleAddDialogOpen}
        onClose={() => setRoleAddDialogOpen(false)}
        onSave={handleCreateRole}
        isLoading={actionLoading === 'create-role'}
      />
    </div>
  );
};

export default SettingsPage;
