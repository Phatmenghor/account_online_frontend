"use client";

import { ROUTES } from "@/constants/AppRoutes/routes";
import { Code, Folder, Layers, Server, User2 } from "lucide-react";
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
      title: "Project",
      href: ROUTES.DASHBOARD.PROJECT,
      icon: Folder,
    },
  ];
}
