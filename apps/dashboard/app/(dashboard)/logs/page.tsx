"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

type LogEntry = {
  id: string;
  identifier: string;
  ruleName: string;
  algorithm: string;
  status: "Allowed" | "Blocked";
  timestamp: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("24h"); // mockup filter
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Mocking query params based on requirement
      const query = new URLSearchParams({
        page: String(page),
        status: statusFilter !== "All" ? statusFilter : "",
        range: dateRange
      });
      const res = await api.get(`/stats/logs?${query.toString()}`);
      setLogs(res.data.data.logs || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Request Logs</h1>
        <p className="text-sm text-[#888888]">Detailed audit trail of all API access attempts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[#111111] border border-[#222222] p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#888888]" />
            <span className="text-sm font-medium text-white">Filters</span>
          </div>
          
          <div className="h-6 w-px bg-[#333333]"></div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm bg-[#0a0a0a] border border-[#333333] text-white px-3 py-1.5 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Allowed">Allowed</option>
            <option value="Blocked">Blocked</option>
          </select>

          <select 
            value={dateRange} 
            onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
            className="text-sm bg-[#0a0a0a] border border-[#333333] text-white px-3 py-1.5 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-[#222222] bg-[#111111]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] text-[#888888]">
            <tr>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Identifier</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Rule Name</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Algorithm</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Status</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">Loading logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">No logs found for this filter.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1a1a1a]/50">
                  <td className="px-6 py-4 font-mono text-xs">{log.identifier}</td>
                  <td className="px-6 py-4">{log.ruleName}</td>
                  <td className="px-6 py-4">{log.algorithm}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${log.status === 'Allowed' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#888888]">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between !mt-4 px-1">
        <span className="text-sm text-[#888888]">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 px-3 py-1 bg-[#111111] border border-[#333333] text-white hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="flex items-center gap-1 px-3 py-1 bg-[#111111] border border-[#333333] text-white hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
