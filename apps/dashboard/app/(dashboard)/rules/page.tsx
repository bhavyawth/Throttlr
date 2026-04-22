"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Plus } from "lucide-react";

type Rule = {
  id: string;
  name: string;
  algorithm: string;
  windowSeconds: number;
  maxRequests: number;
  createdAt: string;
};

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [algorithm, setAlgorithm] = useState("Sliding Window");
  const [windowSeconds, setWindowSeconds] = useState(60);
  const [maxRequests, setMaxRequests] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  async function fetchRules() {
    setLoading(true);
    try {
      const res = await api.get("/rules");
      setRules(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRules();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    try {
      await api.delete(`/rules/${id}`);
      setRules(rules.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete rule");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/rules", {
        name,
        algorithm,
        windowSeconds: Number(windowSeconds),
        maxRequests: Number(maxRequests)
      });
      setRules([...rules, res.data.data]);
      setIsModalOpen(false);
      setName("");
      setWindowSeconds(60);
      setMaxRequests(100);
    } catch (e) {
      console.error(e);
      alert("Failed to create rule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Rules</h1>
          <p className="text-sm text-[#888888]">Define and manage rate limiting policies for your API.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-[#000000] text-sm font-medium hover:bg-[#16a34a] transition-colors border border-[#22c55e]"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      <div className="w-full overflow-x-auto border border-[#222222] bg-[#111111]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] text-[#888888]">
            <tr>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Name</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Algorithm</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Window</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Max Requests</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Created</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[#888888]">Loading rules...</td>
              </tr>
            ) : rules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[#888888]">No rules found. Create one to get started.</td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{rule.name}</td>
                  <td className="px-6 py-4">{rule.algorithm}</td>
                  <td className="px-6 py-4">{rule.windowSeconds}s</td>
                  <td className="px-6 py-4">{rule.maxRequests}</td>
                  <td className="px-6 py-4 text-[#888888]">{new Date(rule.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-[#888888] hover:text-red-500 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#111111] border border-[#222222] text-white">
            <div className="p-6 border-b border-[#222222]">
              <h2 className="text-lg font-bold tracking-tight">Create a New Rule</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#888888]">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g. Free Tier"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#888888]">Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors appearance-none"
                >
                  <option value="Sliding Window">Sliding Window</option>
                  <option value="Token Bucket">Token Bucket</option>
                  <option value="Fixed Window">Fixed Window</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#888888]">Window (seconds)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={windowSeconds}
                    onChange={(e) => setWindowSeconds(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#888888]">Max Requests</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxRequests}
                    onChange={(e) => setMaxRequests(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#888888] hover:text-[#22c55e] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium bg-[#22c55e] text-[#000000] border border-[#22c55e] hover:bg-[#16a34a] transition-colors"
                >
                  {submitting ? "Creating..." : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
