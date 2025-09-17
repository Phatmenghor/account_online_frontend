import { Code, User2 } from "lucide-react";

export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: "/user",
    PROFILE: "/profile",
    PROJECT: "/project",
  },
};

export const navItems = [
  {
    title: "Users",
    href: ROUTES.DASHBOARD.INDEX,
    icon: User2,
  },
  {
    title: "Project",
    href: ROUTES.DASHBOARD.PROJECT,
    icon: Code,
  },
];
