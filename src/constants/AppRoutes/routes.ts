import { User2 } from "lucide-react";

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
  },
  DASHBOARD: {
    INDEX: "/user",
    PROFILE: "/profile",
  },
};

export const navItems = [
  {
    title: "Users",
    href: ROUTES.DASHBOARD.INDEX,
    icon: User2,
  },
];
