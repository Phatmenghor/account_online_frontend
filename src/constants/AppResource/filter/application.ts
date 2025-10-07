import { ApplicationStatus } from "../display-list/enum/application";

export const STATUS_APPLICATION = [
  { value: ApplicationStatus.UAT, label: "UAT" },
  { value: ApplicationStatus.PRODUCTION, label: "Production" },
  { value: ApplicationStatus.ACTIVE, label: "Active" },
  { value: ApplicationStatus.INACTIVE, label: "Inactive" },
  { value: ApplicationStatus.DEVELOPMENT, label: "Development" },
];