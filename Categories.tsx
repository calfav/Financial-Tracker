import { useState } from "react";
import { useFinanceStore, Category } from "@/lib/store";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusIcon } from "lucide-react";

export default function Categories() {
  const { 
    categories, 
    addCategory, 
    updateCategory,
    deleteCategory 
  } = useFinanceStore();
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  
  const incomeCategories = categories.filter(cat => cat.type === "income");
  const expenseCategories = categories.filter(cat => cat.type === "expense");
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };
  
  const handleCategorySubmit = (data: Omit<Category, "id" | "created_at">) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
      setEditingCategory(undefined);
    } else {
      addCategory(data);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button
          onClick={() => {
            setEditingCategory(undefined);
            setCategoryDialogOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">Income</Badge>
              Income Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList 
              categories={incomeCategories} 
              onEdit={handleEditCategory}
              onDelete={deleteCategory}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Badge variant="outline" className="mr-2 bg-red-100 text-red-800 hover:bg-red-100">Expense</Badge>
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList 
              categories={expenseCategories}
              onEdit={handleEditCategory}
              onDelete={deleteCategory}
            />
          </CardContent>
        </Card>
      </div>
      
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={handleCategorySubmit}
        initialData={editingCategory}
      />
    </MainLayout>
  );
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories found.
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Color</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </TableCell>
            <TableCell>{category.name}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <DotsHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(category)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(category.id)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}