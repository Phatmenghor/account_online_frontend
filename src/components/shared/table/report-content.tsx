import { indexDisplay } from "@/utils/common/common";
import { useTranslations } from "next-intl";
import { TableColumn } from "./data-table";
import { Badge } from "@/components/ui/badge";
import { AllReportModel, ReportModel } from "@/models/report/report.response";

export const Report = (data: AllReportModel): TableColumn<ReportModel>[] => {
    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "SUCCESS":
                return "bg-green-100 text-green-800 border-green-200";
            case "FAILURE":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const tCommon = useTranslations("common");

    return [
        {
            key: "index",
            label: "#",
            maxWidth: "60px",
            minWidth: "60px",
            render: (_, index) => (
                <span className="font-medium">
                    {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index)}
                </span>
            ),
        },
        {
            key: "idNumber",
            label: "IdNumber",
            truncate: true,
            maxWidth: "300px",
            minWidth: "150px",
            render: (report) => (
                <span className="font-medium">{report.idNumber || "---"}</span>
            ),
        },
        {
            key: "remark",
            label: "Remark",
            truncate: true,
            maxWidth: "300px",
            minWidth: "150px",
            render: (report) => (
                <span className="font-medium">{report.remark || "---"}</span>
            ),
        },
        {
            key: "status",
            label: "Status",
            truncate: true,
            maxWidth: "150px",
            minWidth: "100px",
            render: (report) => (
                <Badge className={getStatusColor(report?.status ?? "")}>
                    <span className="ml-1">{report?.status || "ACTIVE"}</span>
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Created At",
            truncate: true,
            maxWidth: "300px",
            minWidth: "150px",
            render: (report) => (
                <span className="font-medium">{report.createdAt || "---"}</span>
            ),
        },
    ];
};