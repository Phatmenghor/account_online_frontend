
"use client"
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import Loading from "@/components/shared/common/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_REPORT_OPTIONS } from "@/constants/AppResource/filter/status";
import { DataTable } from "@/components/shared/table/data-table";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchParams } from "next/navigation";
import { AllReferenceModel, ReferenceModel } from "@/models/static/reference/reference.response";
import { Report } from "@/components/shared/table/report-content";
import { AllReportModel } from "@/models/report/report.response";
import { getAllReportService } from "@/services/dashboard/report/report.service";
import { AllReportReq } from "@/models/report/report.request";
import { ReportData, ReportSchema } from "@/components/acc-online/form-field/form-validate-error";
import { toast } from "sonner";

function ReportPageContent() {
    const [datePickerKey, setDatePickerKey] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<AllReportModel | null>(null);
    const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
        baseRoute: ROUTES.DASHBOARD.REPORT,
    });
    const [formData, setFormData] = useState<AllReportReq>({
        fromDate: "",
        toDate: ""
    })
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
    };
    useEffect(() => {
        const pageParam = searchParams.get("pageNo");
        if (!pageParam) {
            updateUrlWithPage(1, true);
        }
    }, [searchParams, updateUrlWithPage]);
    const handleInputChange = (field: keyof AllReportReq, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            console.log('Updated formData:', updated); // <- now shows the latest value
            return updated;
        });
    };
    const handleSearch = () => {
        const newErrors: Record<string, string> = {};

        Object.entries(formData).forEach(([field, value]) => {
            try {
                const fieldSchema = ReportSchema.shape[field as keyof ReportData];
                fieldSchema.parse(value);
            } catch (error: any) {
                if (error.issues?.[0]) {
                    newErrors[field] = error.issues[0].message;
                }
            }
        });

        setValidationErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            loadReport();
        }
    };

    const loadReport = useCallback(async () => {
        setIsLoading(true);
        console.log('this is form date', formData)
        try {
            const response = await getAllReportService({
                pageNo: currentPage,
                pageSize: 15,
                status: statusFilter !== "all" ? statusFilter : undefined,
                fromDate: formData.fromDate,
                toDate: formData.toDate
            });
            if (response) {
                toast.success(response?.message)
            }
            else {
                toast.error("No data found.");
            }
            setReport(response);
        } catch (error: any) {
            console.log("Failed to fetch report: ", error);
            toast.error(error.errorMessage || "Failed to fetch account.");
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, currentPage]);


    return (
        <Card className="h-full flex flex-col">
            <CardContent className="space-y-6 p-6 flex flex-col h-full">
                <div className="py-4">
                    <div className="flex justify-between">
                        <div className="flex flex-wrap items-center justify-start gap-4 w-full">
                            <div className="relative w-full md:w-[350px]">
                                {/* From Date */}
                                <div className="space-y-1">
                                    {/* <Label htmlFor="dob" className="text-sm sm:text-base">
                                        From Date
                                    </Label> */}
                                    <div >
                                        <CustomDatePicker
                                            className="h-10"
                                            value={formData.fromDate}
                                            onChange={(value) => handleInputChange("fromDate", value)}
                                            disabled={false}
                                            placeholder={"From Date"}
                                        />
                                    </div>
                                    {validationErrors.fromDate && (
                                        <span className="text-xs text-red-500">
                                            {validationErrors.fromDate}
                                        </span>
                                    )}
                                </div>


                            </div>
                            <div className="relative w-full md:w-[350px]">
                                {/* To Date */}
                                <div className="space-y-1">
                                    {/* <Label htmlFor="dob" className="text-sm sm:text-base">
                                        To Date
                                    </Label> */}
                                    <div >
                                        <CustomDatePicker
                                            className="h-10"
                                            value={formData.toDate}
                                            onChange={(value) => handleInputChange("toDate", value)}
                                            disabled={false}
                                            placeholder={"To Date"}
                                        />
                                    </div>
                                    {validationErrors.toDate && (
                                        <span className="text-xs text-red-500">
                                            {validationErrors.toDate}
                                        </span>
                                    )}
                                </div>


                            </div>

                            {/* Status Filter Dropdown */}
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[180px] h-10 ">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {STATUS_REPORT_OPTIONS.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="space-x-2">
                                <Button >Export to Excel</Button>
                                <Button onClick={() => handleSearch()} >{"Search"}</Button>
                            </div>
                        </div>
                        <div>

                        </div>
                    </div>
                    <div className="w-full p-4">
                        <Separator className="bg-gray-300" />
                    </div>


                </div>
                {/* Table  */}
                <div className="flex-1 overflow-x-auto">
                    <DataTable
                        data={report?.content || []}
                        loading={false}
                        emptyMessage="No report found"
                        getRowKey={(reference) => reference.id}
                        columns={Report(report ?? { content: [], pageNo: 1, pageSize: 10, totalElements: 0, totalPages: 1 })}
                    />
                    {/* Pagination positioned to the right and outside the scrollable area */}
                    <div className="border-t bg-background p-2 flex justify-end">
                        <CustomPagination
                            currentPage={currentPage}
                            totalPages={report?.totalPages || 1}
                            onPageChange={handlePageChange}
                            size="md"
                        />
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}
export default function ReportPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ReportPageContent />
        </Suspense>
    );
}