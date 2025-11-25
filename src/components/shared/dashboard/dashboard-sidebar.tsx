"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { SidebarUserProfile } from "@/components/app/profile/sidebar-profile";
import { UserModel } from "@/models/user/user.response";
import { useNavItems } from "@/constants/AppResource/display-list/ui-helper/sidebar-item";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import { getUserProfileService } from "@/services/dashboard/user/user.service";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

// ✨ Centralized Permission Configuration
const ROLE_PERMISSIONS = {
  SUPER: [
    ROUTES.DASHBOARD.INDEX,
    ROUTES.DASHBOARD.AML.HISTORY,
    ROUTES.DASHBOARD.AML.MANAGEMENT,
    ROUTES.DASHBOARD.STATIC.MARITAL,
    ROUTES.DASHBOARD.STATIC.OCCUPATION,
    ROUTES.DASHBOARD.STATIC.REFERENCE,
    ROUTES.DASHBOARD.STATIC.BRANCH,
    ROUTES.DASHBOARD.STATIC.LEGAL_TYPE,
    ROUTES.DASHBOARD.STATIC.PROVINCE,
    ROUTES.DASHBOARD.STATIC.DISTRICT,
    ROUTES.DASHBOARD.STATIC.COMMUNE,
    ROUTES.DASHBOARD.STATIC.VILLAGE,
    ROUTES.DASHBOARD.USER,
  ],
  ADMIN: [
    ROUTES.DASHBOARD.INDEX,
    ROUTES.DASHBOARD.AML.HISTORY,
    ROUTES.DASHBOARD.AML.MANAGEMENT,
    ROUTES.DASHBOARD.STATIC.MARITAL,
    ROUTES.DASHBOARD.STATIC.OCCUPATION,
    ROUTES.DASHBOARD.STATIC.REFERENCE,
    ROUTES.DASHBOARD.STATIC.BRANCH,
    ROUTES.DASHBOARD.STATIC.LEGAL_TYPE,
    ROUTES.DASHBOARD.STATIC.PROVINCE,
    ROUTES.DASHBOARD.STATIC.DISTRICT,
    ROUTES.DASHBOARD.STATIC.COMMUNE,
    ROUTES.DASHBOARD.STATIC.VILLAGE,
  ],
  DEVELOPER: "ALL",
} as const;

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [authUser, setAuthUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const hasInitialized = useRef(false);

  const navItems = useNavItems();

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

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

  // ✨ Initialize all submenus as open by default
  useEffect(() => {
    if (!hasInitialized.current && navItems.length > 0) {
      const initialOpenState: Record<string, boolean> = {};

      navItems.forEach((item) => {
        if (item.subItems && item.subItems.length > 0) {
          initialOpenState[item.title] = true;
        }
      });

      setOpenSubmenus(initialOpenState);
      hasInitialized.current = true;
    }
  }, [navItems]);

  // ✨ Simplified Permission Filter
  const getFilteredNavItems = () => {
    if (!authUser?.userRole) return [];

    const userRole =
      authUser.userRole.toUpperCase() as keyof typeof ROLE_PERMISSIONS;
    const allowedRoutes = ROLE_PERMISSIONS[userRole];

    if (!allowedRoutes) return [];
    if (allowedRoutes === "ALL") return navItems;

    return navItems
      .map((item) => {
        if (item.subItems && item.subItems.length > 0) {
          const filteredSubItems = item.subItems.filter((subItem) =>
            allowedRoutes.includes(subItem.href)
          );
          return filteredSubItems.length > 0
            ? { ...item, subItems: filteredSubItems }
            : null;
        }

        return item.href && allowedRoutes.includes(item.href) ? item : null;
      })
      .filter(Boolean) as any[];
  };

  const filteredNavItems = getFilteredNavItems();

  // Hide sidebar on mobile
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card shadow-lg transition-all duration-300 ease-in-out",
          isMobile ? "w-64" : isOpen ? "w-64" : "w-16"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-3 relative">
          {isOpen ? (
            <Link
              href={ROUTES.DASHBOARD.PROFILE}
              className="flex items-center gap-2 transition-opacity duration-200"
            >
              <img
                src={AppIcons.APP.APP_LOGO}
                alt="Internal Dev Logo"
                className="w-10 h-10"
              />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                Account Online
              </span>
            </Link>
          ) : (
            <Link
              href={ROUTES.DASHBOARD.INDEX}
              className="flex items-center justify-center w-full"
            >
              <img
                src={AppIcons.APP.APP_LOGO}
                alt="Internal Dev Logo"
                className="w-10 h-10"
              />
            </Link>
          )}

          {/* Toggle Button - Hide on mobile */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                "absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent transition-all duration-200",
                !isOpen && "rotate-180"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className={cn("grid gap-0.5", isOpen ? "px-2" : "px-1")}>
            {filteredNavItems.map((item) => (
              <div key={item.title} className="flex flex-col">
                {item.subItems ? (
                  <>
                    {/* Parent Item */}
                    {isOpen ? (
                      <div
                        className={cn(
                          "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium",
                          "hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        )}
                        onClick={() => toggleSubmenu(item.title)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            openSubmenus[item.title] && "rotate-90"
                          )}
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex h-9 w-full items-center justify-center rounded-md px-2",
                          "hover:bg-accent hover:text-accent-foreground transition-colors group relative"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                          {item.title}
                        </div>
                      </div>
                    )}

                    {/* Sub Items */}
                    {isOpen && openSubmenus[item.title] && (
                      <div className="ml-4 flex flex-col gap-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-200">
                        {item.subItems.map((sub: any) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "flex h-8 items-center rounded-md px-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                              pathname === sub.href &&
                                "bg-accent text-accent-foreground font-medium"
                            )}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Normal item */
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors group relative",
                      pathname === item.href &&
                        "bg-accent text-accent-foreground",
                      !isOpen && "justify-center"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span>{item.title}</span>}

                    {/* Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                        {item.title}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer User Profile */}
        <div className="border-t p-3">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div
                className={cn(
                  "h-10 bg-slate-200 rounded-md dark:bg-slate-700",
                  isOpen ? "w-full" : "w-10 mx-auto"
                )}
              />
              {isOpen && (
                <div className="h-4 w-3/4 bg-slate-200 rounded-md dark:bg-slate-700" />
              )}
            </div>
          ) : (
            <SidebarUserProfile user={authUser} isOpen={isOpen} />
          )}
        </div>
      </aside>
    </>
  );
}
