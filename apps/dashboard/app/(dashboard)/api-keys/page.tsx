"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Key as KeyIcon, Check, Copy } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // For showing the raw key exactly once
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function fetchKeys() {
    setLoading(true);
    try {
      const res = await api.get("/keys/me");
      if (res.data.data) {
        setKeys(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Revoke this API Key? Traffic using this key will be instantly dropped.")) return;
    try {
      await api.delete(`/keys/${id}`);
      setKeys(keys.filter(k => k.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete API Key");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/keys", { name: newKeyName });
      // assume API returns the raw key inside res.data.data.key and the truncated object in res.data.data
      setGeneratedKey(res.data.data.key || res.data.data.rawKey || "throt_" + res.data.data.id); // fallback if api doesn't match perfectly
      setKeys([...keys, res.data.data]);
    } catch (e) {
      console.error(e);
      alert("Failed to generate key");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeGeneratedModal = () => {
    setGeneratedKey(null);
    setIsModalOpen(false);
    setNewKeyName("");
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">API Keys</h1>
          <p className="text-sm text-[#888888]">Manage access tokens to authenticate with the Throttlr API.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-[#000000] text-sm font-medium hover:bg-[#16a34a] transition-colors border border-[#22c55e]"
        >
          <KeyIcon className="w-4 h-4" />
          Generate Key
        </button>
      </div>

      <div className="w-full overflow-x-auto border border-[#222222] bg-[#111111]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] text-[#888888]">
            <tr>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Name</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Prefix</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Created</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222]">Status</th>
              <th className="px-6 py-3 font-medium border-b border-[#222222] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">Loading API keys...</td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">No API keys found. Generate one.</td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{k.name}</td>
                  <td className="px-6 py-4 font-mono text-zinc-400">{k.keyPrefix}...</td>
                  <td className="px-6 py-4 text-[#888888]">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium border bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="text-[#888888] hover:text-red-500 transition-colors"
                      title="Revoke Key"
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

      {/* Creation / Display Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#111111] border border-[#222222] text-white">
            <div className="p-6 border-b border-[#222222]">
              <h2 className="text-lg font-bold tracking-tight">
                {generatedKey ? "Key Generated Successfully" : "Generate API Key"}
              </h2>
            </div>
            
            {!generatedKey ? (
              <form onSubmit={handleGenerate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#888888]">Key Name</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-[#111111] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="e.g. Production Backend"
                  />
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
                    disabled={submitting || !newKeyName}
                    className="px-4 py-2 text-sm font-medium bg-[#22c55e] text-[#000000] border border-[#22c55e] hover:bg-[#16a34a] transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6">
                <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-sm">
                  Please copy this key and store it somewhere safe. <strong>This key will not be shown again.</strong>
                </div>
                
                <div className="flex items-center justify-between border border-[#333333] bg-[#0a0a0a] p-3">
                  <code className="font-mono text-sm text-white truncate mr-4">{generatedKey}</code>
                  <button
                    onClick={handleCopy}
                    className="flex shrink-0 items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222222] border border-[#333333] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span className="text-xs font-medium">{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={closeGeneratedModal}
                    className="px-4 py-2 text-sm font-medium bg-[#22c55e] text-[#000000] border border-[#22c55e] hover:bg-[#16a34a] transition-colors"
                  >
                    I have saved my key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
