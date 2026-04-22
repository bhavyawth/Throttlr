"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type OverviewStats = {
  totalRequestsToday: number;
  allowedRequests: number;
  blockedRequests: number;
  requestsOverTime: { time: string; requests: number }[];
  recentActivity: { id: string; identifier: string; ruleName: string; status: "Allowed" | "Blocked"; timestamp: string }[];
};

export default function OverviewPage() {
  const [data, setData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/stats/overview");
        setData(res.data.data);
      } catch (e) {
        console.error("Failed to fetch overview", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="w-48 h-8 bg-[#111111] animate-pulse border border-[#222222]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-[#111111] animate-pulse border border-[#222222]" />
          <div className="h-32 bg-[#111111] animate-pulse border border-[#222222]" />
          <div className="h-32 bg-[#111111] animate-pulse border border-[#222222]" />
        </div>
        <div className="h-64 bg-[#111111] animate-pulse border border-[#222222]" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Overview</h1>
        <p className="text-sm text-[#888888]">Monitor your API traffic and rate limit efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] border border-[#222222] p-6 flex flex-col justify-between">
          <h3 className="text-sm text-[#888888] font-medium uppercase tracking-wider mb-2">Total Requests (24h)</h3>
          <p className="text-4xl font-bold text-white">{data.totalRequestsToday.toLocaleString()}</p>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-6 flex flex-col justify-between">
          <h3 className="text-sm text-[#888888] font-medium uppercase tracking-wider mb-2">Allowed Requests</h3>
          <p className="text-4xl font-bold text-[#22c55e]">{data.allowedRequests.toLocaleString()}</p>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-6 flex flex-col justify-between">
          <h3 className="text-sm text-[#888888] font-medium uppercase tracking-wider mb-2">Blocked Requests</h3>
          <p className="text-4xl font-bold text-[#ef4444]">{data.blockedRequests.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] p-6">
        <h3 className="text-base font-semibold text-white mb-6 tracking-tight">Requests Over Time</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.requestsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
              <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#111111", border: "1px solid #333333", borderRadius: 0 }}
                itemStyle={{ color: "#ffffff" }}
              />
              <Line type="monotone" dataKey="requests" stroke="#ffffff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#ffffff" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-white mb-4 tracking-tight">Recent Activity</h3>
        <div className="w-full overflow-x-auto border border-[#222222] bg-[#111111]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] text-[#888888]">
              <tr>
                <th className="px-6 py-3 font-medium border-b border-[#222222]">Identifier</th>
                <th className="px-6 py-3 font-medium border-b border-[#222222]">Rule</th>
                <th className="px-6 py-3 font-medium border-b border-[#222222]">Status</th>
                <th className="px-6 py-3 font-medium border-b border-[#222222]">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.map((act) => (
                <tr key={act.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1a1a1a]/50">
                  <td className="px-6 py-4 font-mono text-xs">{act.identifier}</td>
                  <td className="px-6 py-4">{act.ruleName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${act.status === 'Allowed' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'}`}>
                      {act.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#888888]">{new Date(act.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {data.recentActivity.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#888888]">No activity found in the recent window.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
