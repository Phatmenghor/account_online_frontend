"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { SidebarUserProfile } from "@/components/app/profile/sidebar-profile";
import { UserModel } from "@/models/user/user.response";
import { useNavItems } from "@/constants/AppResource/display-list/ui-helper/sidebar-item";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import { getUserProfileService } from "@/services/dashboard/user/user.service";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [authUser, setAuthUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const navItems = useNavItems();

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getUserProfileService();
        setAuthUser(response || null);
      } catch (error) {
        console.error("Failed to load user profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Filter navigation items based on user role
  const getFilteredNavItems = () => {
    if (!authUser?.userRole) return [];

    const userRole = authUser.userRole.toUpperCase();

    if (userRole === "SUPER") {
      // SUPER gets all tabs (static, aml, and user)
      const allowedTabs = [
        ROUTES.DASHBOARD.AML.HISTORY,
        ROUTES.DASHBOARD.AML.MANAGEMENT,
        ROUTES.DASHBOARD.STATIC.MARITAL,
        ROUTES.DASHBOARD.STATIC.OCCUPATION,
        ROUTES.DASHBOARD.STATIC.REFERENCE,
        ROUTES.DASHBOARD.USER
      ];
      
      return navItems
        .map((item) => {
          // If item has subItems, filter them
          if (item.subItems && item.subItems.length > 0) {
            const filteredSubItems = item.subItems.filter((sub) =>
              allowedTabs.includes(sub.href)
            );
            // Only include parent if it has visible children
            if (filteredSubItems.length > 0) {
              return { ...item, subItems: filteredSubItems };
            }
            return null;
          }
          // For regular items, check if href is allowed
          if (item.href && allowedTabs.includes(item.href)) {
            return item;
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null); // Type-safe filter
  
    } else if (userRole === "ADMIN") {
      // ADMIN gets only static and aml tabs
      const allowedTabs = [
        ROUTES.DASHBOARD.AML.HISTORY,
        ROUTES.DASHBOARD.AML.MANAGEMENT,
        ROUTES.DASHBOARD.STATIC.MARITAL,
        ROUTES.DASHBOARD.STATIC.OCCUPATION,
        ROUTES.DASHBOARD.STATIC.REFERENCE
      ];
      
      return navItems
        .map((item) => {
          if (item.subItems && item.subItems.length > 0) {
            const filteredSubItems = item.subItems.filter((sub) =>
              allowedTabs.includes(sub.href)
            );
            if (filteredSubItems.length > 0) {
              return { ...item, subItems: filteredSubItems };
            }
            return null;
          }
          if (item.href && allowedTabs.includes(item.href)) {
            return item;
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
        
    } else if (userRole === "DEVELOPER") {
      // Show all navigation items for developer
      return navItems;
    }

    return [];
  };
  
  const filteredNavItems = getFilteredNavItems();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out shadow-lg",
          isOpen ? "w-64" : "w-[70px]",
          isMobile && !isOpen && "hidden"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b px-3">
          <Link
            href={ROUTES.DASHBOARD.INDEX}
            className={cn(
              "flex items-center transition-all duration-300",
              isOpen ? "gap-2" : "justify-center w-full"
            )}
          >
            <img
              src={AppIcons.APP.APP_LOGO}
              alt="Internal Dev Logo"
              className={cn(
                "w-10 h-10 transition-all duration-300",
                isOpen ? "mr-0" : "mx-auto h-8 w-7"
              )}
            />
            {isOpen && (
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Account Online
              </span>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "transition-transform duration-300",
              !isOpen && "rotate-180"
            )}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation items */}
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {filteredNavItems.map((item) => (
              <div key={item.title} className="flex flex-col">
                {/* If item has subItems, use button to toggle submenu */}
                {item.subItems ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.title)}
                      className={cn(
                        "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors overflow-hidden",
                        openSubmenus[item.title] &&
                        "bg-accent text-accent-foreground",
                        !isOpen && "justify-center px-0"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span
                        className={cn(
                          "whitespace-nowrap transition-all duration-300 ease-in-out",
                          isOpen
                            ? "opacity-100 translate-x-0 max-w-xs"
                            : "opacity-0 -translate-x-4 max-w-0"
                        )}
                      >
                        {item.title}
                      </span>
                      <ChevronRight
                        className={cn(
                          "ml-auto h-4 w-4 transition-transform duration-200",
                          openSubmenus[item.title] && "rotate-90"
                        )}
                      />
                    </button>

                    {/* Render submenu links */}
                    {openSubmenus[item.title] && isOpen && (
                      <div className="ml-6 flex flex-col gap-1 mt-1">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "flex h-8 items-center rounded-md px-2 text-sm font-normal hover:bg-accent hover:text-accent-foreground transition-colors",
                              pathname === sub.href &&
                              "bg-accent text-accent-foreground"
                            )}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Regular route link
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors overflow-hidden",
                      pathname === item.href &&
                      "bg-accent text-accent-foreground",
                      !isOpen && "justify-center px-0"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span
                      className={cn(
                        "whitespace-nowrap transition-all duration-300 ease-in-out",
                        isOpen
                          ? "opacity-100 translate-x-0 max-w-xs"
                          : "opacity-0 -translate-x-4 max-w-0"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Sidebar footer / user profile */}
        <div className="border-t p-4">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-10 w-full bg-slate-200 rounded-md dark:bg-slate-700" />
              <div className="h-4 w-3/4 bg-slate-200 rounded-md dark:bg-slate-700" />
            </div>
          ) : (
            <SidebarUserProfile user={authUser} isOpen={isOpen} />
          )}
        </div>
      </div>
    </>
  );
}