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
      BRANCH: "/branch",
      PROVINCE: "/province",
    },
    AML: {
      MANAGEMENT: "/aml-management",
      HISTORY: "/aml-history",
    },
    ACCOUNT_ONLINE: "/account-online",
    REPORT: "/report",
  },
};

export const navItems = [
  {
    title: "Users",
    href: ROUTES.DASHBOARD.INDEX,
    icon: User2,
  },
];
