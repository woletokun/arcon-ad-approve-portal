import { Shield, User, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * Header Component
 * 
 * Professional header for ARCON e-Ad Approval Portal
 * Features:
 * - ARCON branding and logo
 * - User authentication status
 * - Notification system
 * - User profile dropdown
 */

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: 'advertiser' | 'reviewer' | 'admin';
  };
  onLogout?: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ARCON Branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground">ARCON</h1>
                <span className="text-xs text-muted-foreground">
                  Advertising Regulatory Council
                </span>
              </div>
            </div>
            <div className="hidden md:block h-6 w-px bg-border" />
            <span className="hidden md:inline-block text-sm font-medium text-muted-foreground">
              e-Ad Approval Portal
            </span>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                  >
                    3
                  </Badge>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {user.role}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex flex-col items-start p-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost">Sign In</Button>
                <Button>Get Started</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};