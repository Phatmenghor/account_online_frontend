"use client";

import { LogOut, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutToken } from "@/utils/local-storage/token";
import { logoutRole } from "@/utils/local-storage/roles";
import LanguageSwitcher from "../common/language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { cn } from "@/lib/utils";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import Link from "next/link";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const t = useTranslations();

  const handleLogout = () => {
    logoutToken();
    logoutRole();

    router.replace(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        <Link
          href={ROUTES.DASHBOARD.INDEX}
          className="flex items-center gap-2 font-semibold"
        >
          <img
            src={AppIcons.APP.CPBANK}
            alt="Special Account"
            className="w-72 h-12"
          />
        </Link>

        <div className="flex items-center gap-3 justify-end flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutAlert(true)}
            className="flex items-center gap-2 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </Button>
        </div>
      </header>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will need to login again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
