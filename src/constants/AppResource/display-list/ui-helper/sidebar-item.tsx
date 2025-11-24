"use client";

import { ROUTES } from "@/constants/AppRoutes/routes";
import {
  Calendar1Icon,
  File,
  FolderClosed,
  IdCard,
  LayoutDashboard,
  User2,
} from "lucide-react";

export function useNavItems() {
  return [
    {
      title: "Dashboard",
      href: ROUTES.DASHBOARD.INDEX,
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: ROUTES.DASHBOARD.USER,
      icon: User2,
    },
    {
      title: "Account Final",
      href: ROUTES.DASHBOARD.ACCOUNT_ONLINE,
      icon: IdCard,
    },
    {
      title: "AML",
      href: "#",
      icon: FolderClosed,
      subItems: [
        {
          title: "Management",
          href: ROUTES.DASHBOARD.AML.MANAGEMENT,
        },
        {
          title: "History",
          href: ROUTES.DASHBOARD.AML.HISTORY,
        },
      ],
    },
    {
      title: "Master Data",
      href: "#",
      icon: Calendar1Icon,
      subItems: [
        {
          title: "Marital",
          href: ROUTES.DASHBOARD.STATIC.MARITAL,
        },
        {
          title: "Occupation",
          href: ROUTES.DASHBOARD.STATIC.OCCUPATION,
        },
        {
          title: "Reference",
          href: ROUTES.DASHBOARD.STATIC.REFERENCE,
        },
        {
          title: "Branch",
          href: ROUTES.DASHBOARD.STATIC.BRANCH,
        },
        {
          title: "Province",
          href: ROUTES.DASHBOARD.STATIC.PROVINCE,
        },
      ],
    },
    {
      title: "Report",
      href: ROUTES.DASHBOARD.REPORT,
      icon: File,
    },
  ];
}
