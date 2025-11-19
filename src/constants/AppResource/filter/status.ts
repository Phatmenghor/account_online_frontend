import { Status } from "../display-list/enum/status";

export const STATUS_FILTER = [
  { value: "ALL", label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.DELETE, label: "Delete" },
];

export const STATUS_USER_OPTIONS = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.DELETE, label: "Delete" },
];

export enum AmlStatusEnum {
  PENDING = "PENDING",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

// To get the list of all enum values
export const AmlStatusList: AmlStatusEnum[] = [
  AmlStatusEnum.PENDING,
  AmlStatusEnum.APPROVE,
  AmlStatusEnum.REJECT,
];
