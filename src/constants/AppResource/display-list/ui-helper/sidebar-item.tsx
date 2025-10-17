"use client";

import { ROUTES } from "@/constants/AppRoutes/routes";
import {
  Calendar1Icon,
  Code,
  Dock,
  FolderClosed,
  LayoutDashboard,
  User,
  User2,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function useNavItems() {
  const t = useTranslations("common");

  return [
    {
      title: t("dashbaord"),
      href: ROUTES.DASHBOARD.INDEX,
      icon: LayoutDashboard ,
    },
    {
      title: t("users"),
      href: ROUTES.DASHBOARD.USER,
      icon: User2,
    },
    {
      title: t("index"),
      href: "#", // main parent, not clickable
      icon: Calendar1Icon,
      subItems: [
        {
          title: t("marital"),
          href: ROUTES.DASHBOARD.STATIC.MARITAL,
        },
        {
          title: t("occupation"),
          href: ROUTES.DASHBOARD.STATIC.OCCUPATION,
        },
        {
          title: t("reference"),
          href: ROUTES.DASHBOARD.STATIC.REFERECE,
          icon: FolderClosed,
        },
      ],
    },
  ];
}
