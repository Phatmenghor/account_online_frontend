"use client";

import { ROUTES } from "@/constants/AppRoutes/routes";
import {
  Calendar1Icon,
  Code,
  Folder,
  Layers,
  Server,
  User2,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function useNavItems() {
  const t = useTranslations("common");

  return [
    {
      title: t("users"),
      href: ROUTES.DASHBOARD.INDEX,
      icon: User2,
    },
    {
      title: t("project"),
      href: ROUTES.DASHBOARD.PROJECT,
      icon: Folder,
    },
    {
      title: t("attendance"),
      href: ROUTES.DASHBOARD.ATTENDANCE,
      icon: Calendar1Icon,
    },
  ];
}
