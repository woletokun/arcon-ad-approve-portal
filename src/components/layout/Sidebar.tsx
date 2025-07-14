import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Shield, 
  BarChart3, 
  Settings,
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Sidebar Navigation Component
 * 
 * Role-based navigation sidebar for the ARCON portal
 * Features:
 * - Different navigation items based on user role
 * - Active route highlighting
 * - Notification badges for pending items
 * - Responsive design
 */

interface SidebarProps {
  userRole: 'advertiser' | 'reviewer' | 'admin';
  pendingCount?: number;
  className?: string;
  onViewChange?: (view: string) => void;
}

export const Sidebar = ({ userRole, pendingCount = 0, className, onViewChange }: SidebarProps) => {
  const location = useLocation();

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ['advertiser', 'reviewer', 'admin'],
        badge: undefined as number | undefined
      }
    ];

    const advertiserItems = [
      {
        title: "Submit Ad",
        href: "/submit",
        icon: Upload,
        roles: ['advertiser'],
        badge: undefined as number | undefined
      },
      {
        title: "My Submissions",
        href: "/submissions",
        icon: FileText,
        roles: ['advertiser'],
        badge: undefined as number | undefined
      },
      {
        title: "Certificates",
        href: "/certificates",
        icon: CheckCircle,
        roles: ['advertiser'],
        badge: undefined as number | undefined
      }
    ];

    const reviewerItems = [
      {
        title: "Review Queue",
        href: "/review",
        icon: AlertCircle,
        roles: ['reviewer', 'admin'],
        badge: pendingCount > 0 ? pendingCount : undefined
      },
      {
        title: "All Submissions",
        href: "/all-submissions",
        icon: FileText,
        roles: ['reviewer', 'admin'],
        badge: undefined as number | undefined
      },
      {
        title: "Approved Ads",
        href: "/approved",
        icon: CheckCircle,
        roles: ['reviewer', 'admin'],
        badge: undefined as number | undefined
      }
    ];

    const adminItems = [
      {
        title: "Users",
        href: "/users",
        icon: Users,
        roles: ['admin'],
        badge: undefined as number | undefined
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        roles: ['admin'],
        badge: undefined as number | undefined
      },
       {
         title: "Settings",
         href: "/settings",
         icon: Settings,
         roles: ['admin'],
         badge: undefined as number | undefined
       }
     ];

     const profileItem = {
       title: "Profile",
       href: "#profile", 
       icon: Settings,
       roles: ['advertiser', 'reviewer', 'admin'],
       badge: undefined as number | undefined
     };

     return [...baseItems, ...advertiserItems, ...reviewerItems, ...adminItems, profileItem]
       .filter(item => item.roles.includes(userRole));
   };

   const navigationItems = getNavigationItems();

  return (
    <aside className={cn(
      "w-64 bg-card border-r flex flex-col h-full",
      className
    )}>
      {/* Navigation Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-semibold text-sm">Portal Navigation</h2>
            <p className="text-xs text-muted-foreground capitalize">{userRole} Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
           return item.href === '#profile' ? (
             <button
               key={item.href}
               onClick={() => onViewChange?.('profile')}
               className={cn(
                 "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-left",
                 "text-muted-foreground hover:text-foreground hover:bg-muted"
               )}
             >
               <div className="flex items-center space-x-3">
                 <Icon className="h-4 w-4" />
                 <span>{item.title}</span>
               </div>
               {item.badge && (
                 <Badge 
                   variant="destructive" 
                   className="h-5 w-5 p-0 text-xs"
                 >
                   {item.badge}
                 </Badge>
               )}
             </button>
           ) : (
             <NavLink
               key={item.href}
               to={item.href}
               onClick={() => onViewChange?.('dashboard')}
               className={cn(
                 "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                 isActive
                   ? "bg-primary text-primary-foreground"
                   : "text-muted-foreground hover:text-foreground hover:bg-muted"
               )}
             >
               <div className="flex items-center space-x-3">
                 <Icon className="h-4 w-4" />
                 <span>{item.title}</span>
               </div>
               {item.badge && (
                 <Badge 
                   variant={isActive ? "secondary" : "destructive"} 
                   className="h-5 w-5 p-0 text-xs"
                 >
                   {item.badge}
                 </Badge>
               )}
             </NavLink>
           );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">ARCON Portal v1.0</p>
          <p>© 2024 Intelligence Index Limited</p>
        </div>
      </div>
    </aside>
  );
};