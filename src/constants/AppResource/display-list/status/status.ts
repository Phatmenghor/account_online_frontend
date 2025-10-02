import { Value } from "@radix-ui/react-select";
import { ProjectStatus, Status } from "../../filter/filter";

export const STATUS_FILTER = [
  { value: "ALL", label: "All Status" },
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
];

export const STATUS_USER_OPTIONS = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
];

export enum ModalMode {
  CREATE_MODE = "create",
  UPDATE_MODE = "update",
}


export const STATUS_PROJECT = [
  {value: ProjectStatus.UAT, label: "UAT"},
  {value: ProjectStatus.PRODUCTION, label: "Production"}
]