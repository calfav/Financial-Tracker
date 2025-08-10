import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category } from "@/lib/store";
import { HexColorPicker } from "react-colorful";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (category: Omit<Category, "id" | "created_at">) => void;
  initialData?: Partial<Category>;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CategoryFormDialogProps) {
  const [type, setType] = useState<"income" | "expense">(
    initialData?.type || "expense"
  );
  const [name, setName] = useState(initialData?.name || "");
  const [color, setColor] = useState(initialData?.color || "#3b82f6");
  const [icon, setIcon] = useState(initialData?.icon || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    onSubmit({
      name: name.trim(),
      type,
      color,
      icon: icon.trim() || undefined,
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            Categories help you organize your financial transactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Tabs
              defaultValue={type}
              value={type}
              onValueChange={(value) => setType(value as "income" | "expense")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expense</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="name" className="col-span-4">
                Category Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-4"
                placeholder="e.g., Groceries, Salary, etc."
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Category Color</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-32"
                />
              </div>
              <HexColorPicker color={color} onChange={setColor} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Icon name or emoji"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}