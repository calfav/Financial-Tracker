import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/lib/store-with-supabase';
import { 
  BarChart3Icon,
  PieChartIcon,
  WalletIcon,
  SettingsIcon,
  UserIcon,
  TagIcon,
  LogOutIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Mobile navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 bg-primary text-white shadow-lg"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />
      
      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 pt-6">{children}</main>
    </div>
  );
}

function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  return (
    <nav
      className={cn(
        "border-r bg-background flex-col w-64 p-4 h-full",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight flex items-center">
            <WalletIcon className="mr-2 h-5 w-5" />
            FinanceTracker
          </h2>
        </div>
        <div className="space-y-1 px-3">
          <SidebarItem
            href="/"
            icon={<BarChart3Icon className="mr-2 h-4 w-4" />}
            text="Dashboard"
            active={location.pathname === "/"}
          />
          <SidebarItem
            href="/transactions"
            icon={<PieChartIcon className="mr-2 h-4 w-4" />}
            text="Transactions"
            active={location.pathname === "/transactions"}
          />
          <SidebarItem
            href="/categories"
            icon={<TagIcon className="mr-2 h-4 w-4" />}
            text="Categories"
            active={location.pathname === "/categories"}
          />
          <SidebarItem
            href="/settings"
            icon={<SettingsIcon className="mr-2 h-4 w-4" />}
            text="Settings"
            active={location.pathname === "/settings"}
          />
        </div>
      </div>
      <div className="mt-auto">
        <SidebarItem
          href="/profile"
          icon={<UserIcon className="mr-2 h-4 w-4" />}
          text="Profile"
          active={location.pathname === "/profile"}
        />
        <Button
          variant="ghost"
          className="w-full justify-start mt-2"
          onClick={async () => {
            // Handle logout with Supabase
            await useFinanceStore.getState().logout();
          }}
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

function SidebarItem({ href, icon, text, active }: SidebarItemProps) {
  return (
    <Link to={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        {icon}
        {text}
      </Button>
    </Link>
  );
}