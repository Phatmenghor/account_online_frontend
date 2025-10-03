import { Calendar, Code, Dock, User2 } from "lucide-react";

export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: "/dashboard",
    USER: "/user",
    PROFILE: "/profile",
    PROJECT: "/project",
    APPLICATION: "/application",
    TRAINEE: "/trainee",
    ATTENDANCE: {
      REQUEST: "/attendance-request",
      HISTORY: "/attendance-history",
    },
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
  {
    title: "Attendance",
    href: ROUTES.DASHBOARD.ATTENDANCE,
    icon: Calendar,
  },
  {
    title: "Application",
    href: ROUTES.DASHBOARD.APPLICATION,
    icon: Dock,
  },
  {
    title: "Trainee",
    href: ROUTES.DASHBOARD.TRAINEE,
    icon: Dock,
  },
];
