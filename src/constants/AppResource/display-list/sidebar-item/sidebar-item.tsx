"use client";

import { ROUTES } from "@/constants/AppRoutes/routes";
import { User2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function useNavItems() {
  const t = useTranslations("common");

  return [
    {
      title: t("users"),
      href: ROUTES.DASHBOARD.INDEX,
      icon: User2,
    },
  ];
}
