import { useState, useEffect } from "react";
import CategoriesTable from "@/components/partials/categoriesComponent/categorieTable";
import BadgesTable from "@/components/partials/badgesComponent/badgesTable";
import PageHead from "@/components/shared/page-head";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RootState } from "@/store/app/rootReducer";
import type { AppDispatch } from "@/store/app/store";
import { fetchBadgesRequest } from "@/store/features/badges/badges.actions";
import { fetchCategoriesRequest } from "@/store/features/categories/categories.actions";
import { SlidersHorizontal, Plus, FolderOpen, Award } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";


interface Badge {
    id:string
    name: string
    description: string
    image: string

}


const SettingsPage = () => {
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
  const [categoryData, setCategoryData] = useState([]);
  const [badgeData, setBadgeData] = useState([]);
  const [currentCategoriesPage, setCurrentCategoriesPage] = useState(1);
  const [currentBadgesPage, setCurrentBadgesPage] = useState(1);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCategoriesRequest())
    dispatch(fetchBadgesRequest());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0) {
      setCategoryData(categories);
    }
    if (badges.length > 0) {
      setBadgeData(badges);
    }
  }, [categories, badges]);

const handleEditCategory = async (category: Category) => {
  console.log('Edit category:', category)
    

}

const handleDeleteCategory = async (category: Category) => {
  try {
    await dispatch(deleteCategoryRequest(category._id))
    console.log('Category deleted successfully')
  } catch (error) {
    console.error('Failed to delete category:', error)
  }
}

  const handleCategoriesPageChange = (page: number) => {
    setCurrentCategoriesPage(page);
  };

  const handleBadgesPageChange = (page: number) => {
    setCurrentBadgesPage(page);
  };

  const handleEditBadge = (badge: Badge) => {
  console.log('Edit badge:', badge)
}

  const handleDeleteBadge = async (badge: Badge) => {
    try {
      // Your API call to delete the badge
      await dispatch(deleteBadgeRequest(badge._id));
      // Show success message
      console.log("Badge deleted successfully");
    } catch (error) {
      console.error("Failed to delete badge:", error);
      // Show error message
    }
  };

  // Empty state components remain the same...
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
        <Button>
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Badge
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageHead
          title="Settings page"
          icon={SlidersHorizontal}
          description="Manage your categories and badges"
        />
      </div>
      <Tabs
        defaultValue="categories"
        className="w-[1000px] mx-auto border-slate-300 shadow-md"
      >
        <TabsList className="justify-evenly flex w-full">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          {categoriesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        </TabsContent>

        <TabsContent value="badges">
          {badgesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
