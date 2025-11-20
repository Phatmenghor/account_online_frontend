"use client";

import React, { useState, useEffect } from "react";
import AmlStatisticsChart from "@/components/app/aml/aml-chart";
import { AllAmlStatisticsModel } from "@/models/aml/chart/aml-chart.response";
import { getAccountOnlineReportService } from "@/services/dashboard/aml/aml.service";
import { Button } from "@/components/ui/button";
import { Search, XCircle } from "lucide-react";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const Dashboard = () => {
  const [data, setData] = useState<AllAmlStatisticsModel>([]);
  const [loading, setLoading] = useState(false);

  // Default fromDate: 7 days ago, toDate: today
  const today = new Date();
  const defaultFromDate = formatDate(
    new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  );
  const defaultToDate = formatDate(today);

  const [fromDate, setFromDate] = useState<string>(defaultFromDate);
  const [toDate, setToDate] = useState<string>(defaultToDate);

  const fetchData = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const response = await getAccountOnlineReportService({
        fromDate: from || defaultFromDate,
        toDate: to || defaultToDate,
      });
      setData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(fromDate, toDate);
  }, []);

  const handleSearch = () => {
    if (!fromDate || !toDate) return;
    fetchData(fromDate, toDate);
  };

  const handleClear = () => {
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
    fetchData(defaultFromDate, defaultToDate);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">AML Dashboard</h1>

      {/* Date Filter */}
      <div className="flex gap-2 mb-4 items-center">
        <CustomDatePicker
          value={fromDate}
          onChange={setFromDate}
          placeholder="From Date"
        />
        <CustomDatePicker
          value={toDate}
          onChange={setToDate}
          placeholder="To Date"
        />

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleSearch}
          disabled={!fromDate || !toDate}
        >
          <Search className="w-5 h-5" /> Apply
        </Button>

        {(fromDate !== defaultFromDate || toDate !== defaultToDate) && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleClear}
          >
            <XCircle className="w-5 h-5" /> Clear
          </Button>
        )}
      </div>

      {/* Chart */}
      {loading ? <p>Loading...</p> : <AmlStatisticsChart data={data} />}
    </div>
  );
};

export default Dashboard;
