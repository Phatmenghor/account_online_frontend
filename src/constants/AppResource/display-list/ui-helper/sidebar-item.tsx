"use client";

import { ROUTES } from "@/constants/AppRoutes/routes";
import {
  Calendar1Icon,
  Code,
  Dock,
  FolderClosed,
  User,
  User2,
} from "lucide-react";
import { useTranslations } from "next-intl";

export function useNavItems() {
  const t = useTranslations("common");
  const tT = useTranslations("attendance");

  return [
    {
      title: t("dashbaord"),
      href: ROUTES.DASHBOARD.INDEX,
      icon: User2,
    },
    {
      title: t("users"),
      href: ROUTES.DASHBOARD.USER,
      icon: User,
    },
    {
      title: t("project"),
      href: ROUTES.DASHBOARD.PROJECT,
      icon: Code,
    },
    {
      title: tT("trainee.index"),
      href: "#", // main parent, not clickable
      icon: Calendar1Icon,
      subItems: [
        {
          title: tT("trainee.request"),
          href: ROUTES.DASHBOARD.ATTENDANCE.REQUEST,
        },
        {
          title: tT("trainee.history"),
          href: ROUTES.DASHBOARD.ATTENDANCE.HISTORY,
        },
        {
          title: t("trainee"),
          href: ROUTES.DASHBOARD.TRAINEE,
          icon: FolderClosed,
        },
      ],
    },
    {
      title: t("application"),
      href: ROUTES.DASHBOARD.APPLICATION,
      icon: Dock,
    },
  ];
}
