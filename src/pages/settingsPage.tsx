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
import { SlidersHorizontal, Plus, FolderOpen, Award, Folder, Shield } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import CategoryEditDialog from "@/components/partials/categoriesComponent/CategoryEditDialog";
import CategoryAddDialog from "@/components/partials/categoriesComponent/CategoryAddDialog";
import BadgeEditDialog from "@/components/partials/badgesComponent/BadgeEditDialog";
import BadgeAddDialog from "@/components/partials/badgesComponent/BadgeAddDialog";
import RolesTable from "@/components/partials/rolesComponent/RolesTable";
import RoleEditDialog from "@/components/partials/rolesComponent/RoleEditDialog";
import { 
  fetchRolesRequest,
  updateRoleRequest,
  deleteRoleRequest
} from "@/store/features/roles/roles.actions";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<SettingsView>('categories');
  const {
    categories,
    isLoading: categoriesLoading,
    pagination: categoriesPagination,
  } = useSelector((state: RootState) => state.categories) as any;
  const {
    badges,
    isLoading: badgesLoading,
    pagination: badgesPagination,
  } = useSelector((state: RootState) => state.badges) as any;
  const {
    roles,
    isLoading: rolesLoading,
  } = useSelector((state: RootState) => state.roles) as any;
  
  // Keep local state for optimistic updates
  const [optimisticCategories, setOptimisticCategories] = useState<Category[]>([]);
  const [optimisticBadges, setOptimisticBadges] = useState<Badge[]>([]);
  const [optimisticRoles, setOptimisticRoles] = useState<any[]>([]);
  
  const [currentCategoriesPage, setCurrentCategoriesPage] = useState(1);
  const [currentBadgesPage, setCurrentBadgesPage] = useState(1);

  // Dialog states
  const [categoryEditDialogOpen, setCategoryEditDialogOpen] = useState(false);
  const [categoryAddDialogOpen, setCategoryAddDialogOpen] = useState(false);
  const [badgeEditDialogOpen, setBadgeEditDialogOpen] = useState(false);
  const [badgeAddDialogOpen, setBadgeAddDialogOpen] = useState(false);
  const [roleEditDialogOpen, setRoleEditDialogOpen] = useState(false);
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

  // Sync Redux state with optimistic state
  useEffect(() => {
    setOptimisticCategories(categories);
  }, [categories]);

  useEffect(() => {
    setOptimisticBadges(badges);
  }, [badges]);

  useEffect(() => {
    setOptimisticRoles(roles);
  }, [roles]);

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryEditDialogOpen(true);
  };

  const handleSaveCategory = async (categoryId: string, data: Partial<Category>) => {
    setActionLoading(categoryId);
    try {
      // Optimistic update - update UI immediately
      setOptimisticCategories(prev => 
        prev.map(category => 
          category._id === categoryId ? { ...category, ...data } : category
        )
      );
      
      // Then make API call
      await dispatch(updateCategoryRequest(categoryId, data));
      toast.success(t('categories.updatedSuccessfully'));
      setCategoryEditDialogOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      // Revert optimistic update on error
      setOptimisticCategories(categories);
      toast.error(error?.message || t('categories.updateFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCategory = async (data: any) => {
    setActionLoading('create-category');
    const tempCategory = { _id: `temp-category-${Date.now()}`, ...data };
    setOptimisticCategories(prev => [tempCategory, ...prev]);
    try {
      await dispatch(createCategoryRequest(data));
      toast.success(t('categories.createdSuccessfully'));
      setCategoryAddDialogOpen(false);
    } catch (error: any) {
      setOptimisticCategories(categories);
      toast.error(error?.message || t('categories.createFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      // Optimistic update - remove immediately from UI
      setOptimisticCategories(prev => 
        prev.filter(cat => cat._id !== category._id)
      );
      
      await dispatch(deleteCategoryRequest(category._id));
      toast.success(t('categories.deletedSuccessfully'));
    } catch (error: any) {
      // Revert on error
      setOptimisticCategories(categories);
      toast.error(error?.message || t('categories.deleteFailed'));
    }
  };

  const handleEditBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setBadgeEditDialogOpen(true);
  };

  const handleSaveBadge = async (badgeId: string, data: Partial<Badge>) => {
    setActionLoading(badgeId);
    try {
      // Optimistic update
      setOptimisticBadges(prev => 
        prev.map(badge => 
          badge._id === badgeId ? { ...badge, ...data } : badge
        )
      );
      
      await dispatch(updateBadgeRequest(badgeId, data));
      toast.success(t('badges.updatedSuccessfully'));
      setBadgeEditDialogOpen(false);
      setSelectedBadge(null);
    } catch (error: any) {
      // Revert on error
      setOptimisticBadges(badges);
      toast.error(error?.message || t('badges.updateFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBadge = async (data: any) => {
    setActionLoading('create-badge');
    const tempBadge = { _id: `temp-badge-${Date.now()}`, ...data };
    setOptimisticBadges(prev => [tempBadge, ...prev]);
    try {
      await dispatch(createBadgeRequest(data));
      toast.success(t('badges.createdSuccessfully'));
      setBadgeAddDialogOpen(false);
    } catch (error: any) {
      setOptimisticBadges(badges);
      toast.error(error?.message || t('badges.createFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBadge = async (badge: Badge) => {
    try {
      // Optimistic update
      setOptimisticBadges(prev => 
        prev.filter(b => b._id !== badge._id)
      );
      
      await dispatch(deleteBadgeRequest(badge._id));
      toast.success(t('badges.deletedSuccessfully'));
    } catch (error: any) {
      // Revert on error
      setOptimisticBadges(badges);
      toast.error(error?.message || t('badges.deleteFailed'));
    }
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setRoleEditDialogOpen(true);
  };

  const handleSaveRole = async (roleId: string, data: any) => {
    setActionLoading(roleId);
    try {
      // Optimistic update
      setOptimisticRoles(prev => 
        prev.map(role => 
          role._id === roleId 
            ? { ...role, rights: data.rights.length > 0 ? data.rights : role.rights }
            : role
        )
      );
      
      await dispatch(updateRoleRequest(roleId, data));
      toast.success(t('roles.updatedSuccessfully'));
      setRoleEditDialogOpen(false);
      setSelectedRole(null);
    } catch (error: any) {
      // Revert on error
      setOptimisticRoles(roles);
      toast.error(error?.message || t('roles.updateFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRole = async (role: any) => {
    try {
      // Optimistic update
      setOptimisticRoles(prev => 
        prev.filter(r => r._id !== role._id)
      );
      
      await dispatch(deleteRoleRequest(role._id));
      toast.success(t('roles.deletedSuccessfully'));
    } catch (error: any) {
      // Revert on error
      setOptimisticRoles(roles);
      toast.error(error?.message || t('roles.deleteFailed'));
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
        <CardTitle className="text-xl">{t('categories.noCategoriesFound')}</CardTitle>
        <CardDescription>
          {t('categories.getStartedCategory')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={() => setCategoryAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('categories.createCategory')}
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
        <CardTitle className="text-xl">{t('badges.noBadgesFound')}</CardTitle>
        <CardDescription>
          {t('badges.getStartedBadge')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={() => setBadgeAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('badges.createBadge')}
        </Button>
      </CardContent>
    </Card>
  );

  // Determine which data to display - use optimistic data if available, otherwise use Redux data
  const displayCategories = optimisticCategories.length > 0 ? optimisticCategories : categories;
  const displayBadges = optimisticBadges.length > 0 ? optimisticBadges : badges;
  const displayRoles = optimisticRoles.length > 0 ? optimisticRoles : roles;
  const categoriesTableKey = `categories-${currentCategoriesPage}`;
  const badgesTableKey = `badges-${currentBadgesPage}`;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <PageHead
          title={t('settings.title')}
          icon={SlidersHorizontal}
          description={t('settings.description')}
          total={0}
        />
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{t('settings.navigation')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1 p-2 flex flex-col">
                <Button
                  variant={activeView === 'categories' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('categories')}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {t('categories.title')}
                </Button>
                <Button
                  variant={activeView === 'badges' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('badges')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  {t('badges.title')}
                </Button>
                <Button
                  variant={activeView === 'roles' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveView('roles')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t('roles.title')}
                </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeView === 'categories' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{t('categories.title')}</h2>
                  <p className="text-muted-foreground">
                    {t('categories.organizeContent')}
                  </p>
                </div>
                <Button onClick={() => setCategoryAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('categories.addCategory')}
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
              ) : displayCategories.length > 0 ? (
                <CategoriesTable
                  key={categoriesTableKey}
                  data={displayCategories}
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
                  <h2 className="text-2xl font-bold">{t('badges.title')}</h2>
                  <p className="text-muted-foreground">
                    {t('badges.rewardUsers')}
                  </p>
                </div>
                <Button onClick={() => setBadgeAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('badges.addBadge')}
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
              ) : displayBadges.length > 0 ? (
                <BadgesTable
                  key={badgesTableKey}
                  data={displayBadges}
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
                  <h2 className="text-2xl font-bold">{t('roles.title')}</h2>
                  <p className="text-muted-foreground">
                    {t('roles.description')}
                  </p>
                </div>
                {/* <Button onClick={() => setRoleAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button> */}
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
              ) : displayRoles.length > 0 ? (
                <RolesTable
                  data={displayRoles}
                  onDelete={handleDeleteRole}
                  onEdit={handleEditRole}
                />
              ) : (
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Shield className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl">{t('roles.noRolesFound')}</CardTitle>
                    <CardDescription>
                      {t('roles.emptyDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    {/* <Button onClick={() => setRoleAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button> */}
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
    </div>
  );
};

export default SettingsPage;