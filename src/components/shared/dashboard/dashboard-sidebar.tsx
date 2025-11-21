"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { SidebarUserProfile } from "@/components/app/profile/sidebar-profile";
import { UserModel } from "@/models/user/user.response";
import { useNavItems } from "@/constants/AppResource/display-list/ui-helper/sidebar-item";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import { getUserProfileService } from "@/services/dashboard/user/user.service";

export function DashboardSidebar() {
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
      const allowedTabs = [
        ROUTES.DASHBOARD.AML.HISTORY,
        ROUTES.DASHBOARD.AML.MANAGEMENT,
        ROUTES.DASHBOARD.STATIC.MARITAL,
        ROUTES.DASHBOARD.STATIC.OCCUPATION,
        ROUTES.DASHBOARD.STATIC.REFERENCE,
        ROUTES.DASHBOARD.USER,
      ];

      return navItems
        .map((item) => {
          if (item.subItems && item.subItems.length > 0) {
            const filtered = item.subItems.filter((s) =>
              allowedTabs.includes(s.href)
            );
            return filtered.length ? { ...item, subItems: filtered } : null;
          }
          return item.href && allowedTabs.includes(item.href) ? item : null;
        })
        .filter(Boolean) as any[];
    }

    if (userRole === "ADMIN") {
      const allowedTabs = [
        ROUTES.DASHBOARD.AML.HISTORY,
        ROUTES.DASHBOARD.AML.MANAGEMENT,
        ROUTES.DASHBOARD.STATIC.MARITAL,
        ROUTES.DASHBOARD.STATIC.OCCUPATION,
        ROUTES.DASHBOARD.STATIC.REFERENCE,
      ];

      return navItems
        .map((item) => {
          if (item.subItems && item.subItems.length > 0) {
            const filtered = item.subItems.filter((s) =>
              allowedTabs.includes(s.href)
            );
            return filtered.length ? { ...item, subItems: filtered } : null;
          }
          return item.href && allowedTabs.includes(item.href) ? item : null;
        })
        .filter(Boolean) as any[];
    }

    if (userRole === "DEVELOPER") {
      return navItems; // Developer sees all items
    }

    return [];
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <>
      {/* Always-Open Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card w-64 shadow-lg"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-start border-b px-3">
          <Link
            href={ROUTES.DASHBOARD.INDEX}
            className="flex items-center gap-2"
          >
            <img
              src={AppIcons.APP.APP_LOGO}
              alt="Internal Dev Logo"
              className="w-10 h-10"
            />
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Account Online
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-0.5 px-2">
            {filteredNavItems.map((item) => (
              <div key={item.title} className="flex flex-col">
                {item.subItems ? (
                  <>
                    {/* Parent Item */}
                    <div
                      className={cn(
                        "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium",
                        "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>

                    {/* Sub Items */}
                    <div className="ml-4 flex flex-col gap-0.5 mt-0.5">
                      {item.subItems.map((sub: any) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "flex h-7 items-center rounded-md px-2 text-sm hover:bg-accent hover:text-accent-foreground",
                            pathname === sub.href &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Normal item */
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer User Profile */}
        <div className="border-t p-4">
          {isLoading ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-10 w-full bg-slate-200 rounded-md dark:bg-slate-700" />
              <div className="h-4 w-3/4 bg-slate-200 rounded-md dark:bg-slate-700" />
            </div>
          ) : (
            <SidebarUserProfile user={authUser} isOpen={true} />
          )}
        </div>
      </div>
    </>
  );
}
