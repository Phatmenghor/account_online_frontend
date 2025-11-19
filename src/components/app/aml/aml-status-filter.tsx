"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AmlStatusEnum } from "@/constants/AppResource/display-list/enum/status";

interface AmlStatusFilterProps {
  selectedStatus?: AmlStatusEnum;
  onChange: (status: AmlStatusEnum) => void;
}

const statusList: { label: string; value: AmlStatusEnum; color: string }[] = [
  {
    label: "All",
    value: AmlStatusEnum.ALL,
    color: "bg-gray-200 text-gray-800",
  },
  {
    label: "Approved",
    value: AmlStatusEnum.APPROVE,
    color: "bg-green-100 text-green-800",
  },
  {
    label: "Rejected",
    value: AmlStatusEnum.REJECT,
    color: "bg-red-100 text-red-800",
  },
  {
    label: "Pending",
    value: AmlStatusEnum.PENDING,
    color: "bg-yellow-100 text-yellow-800",
  },
];

export default function AmlStatusFilter({
  selectedStatus = AmlStatusEnum.ALL,
  onChange,
}: AmlStatusFilterProps) {
  const [status, setStatus] = useState<AmlStatusEnum>(selectedStatus);

  const handleClick = (value: AmlStatusEnum) => {
    setStatus(value);
    onChange(value);
  };

  return (
    <div className="flex gap-2">
      {statusList.map((item) => (
        <Button
          key={item.value}
          size="sm"
          variant={status === item.value ? "default" : "outline"}
          className={`${item.color} rounded-full px-3 py-1 text-sm font-medium`}
          onClick={() => handleClick(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
