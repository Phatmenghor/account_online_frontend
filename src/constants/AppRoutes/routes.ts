import { Calendar, Code, Dock, User2 } from "lucide-react";

export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: {
    INDEX: "/dashboard",
    USER: "/user",
    PROFILE: "/profile",
    STATIC: {
      MARITAL: "/marital",
      OCCUPATION: "/occupation",
      REFERENCE: "/reference",
    },
    AML: {
      MANAGEMENT: "/history",
      HISTORY: "/management"
    },
    ACCOUNT_ONLINE: "/account-online",
  },
};

export const navItems = [
  {
    title: "Users",
    href: ROUTES.DASHBOARD.INDEX,
    icon: User2,
  },
];
