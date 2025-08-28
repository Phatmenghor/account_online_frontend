"use client";

import { CustomSelect } from "@/components/shared/select/custom-select";
import { useTranslations } from "next-intl";
import { Status } from "../../filter/filter";
import { Dispatch, SetStateAction } from "react";

interface filterProps {
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
}
export default function StatusFilter({
  statusFilter,
  setStatusFilter,
}: filterProps) {
  const t = useTranslations("common.status");

  const STATUS_FILTER = [
    { value: "ALL", label: t("all") },
    { value: Status.ACTIVE, label: t("active") },
    { value: Status.INACTIVE, label: t("inactive") },
  ];

  return (
    <CustomSelect
      options={STATUS_FILTER}
      value={statusFilter}
      placeholder={t("all")}
      onValueChange={(value) => setStatusFilter(value as Status)}
    />
  );
}
