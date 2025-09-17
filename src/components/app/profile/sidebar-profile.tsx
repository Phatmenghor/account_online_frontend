"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { cn } from "@/lib/utils";
import { UserModel } from "@/models/user/user.response";
import Link from "next/link";

export function SidebarUserProfile({
  user,
  isOpen,
}: {
  user: UserModel | null;
  isOpen: boolean;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={ROUTES.DASHBOARD.PROFILE}
            className={cn(
              "flex items-center gap-3 rounded-xl p-3 bg-accent/30 hover:bg-accent/50 transition-colors duration-300 cursor-pointer group",
              !isOpen && "justify-center"
            )}
          >
            <Avatar className="h-10 w-10 border-2 border-background dark:border-card shadow-sm group-hover:border-primary/30 transition-all">
              <AvatarImage
                src={
                  user?.profileUrl
                    ? `${process.env.NEXT_PUBLIC_API_IMAGE}${user.profileUrl}`
                    : ""
                }
                alt="Profile"
              />
              <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-semibold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {isOpen && (
              <div className="grid gap-0.5 text-sm overflow-hidden">
                <div className="font-medium capitalize truncate">
                  {user?.fullName || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {user?.email || "user@example.com"}
                </div>
              </div>
            )}
          </Link>
        </TooltipTrigger>

        {/* Tooltip only shows when sidebar is collapsed */}
        {!isOpen && (
          <TooltipContent side="right">
            <div className="flex flex-col">
              <span className="font-medium">{user?.fullName || "User"}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email || "user@example.com"}
              </span>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
