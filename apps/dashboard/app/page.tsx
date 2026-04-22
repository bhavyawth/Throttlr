import Link from "next/link";
import { Shield, LayoutDashboard, Key } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#222222] bg-[#0a0a0a]">
        <div className="font-bold text-xl tracking-tight">Throttlr</div>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium border border-[#222222] bg-[#111111] text-white hover:bg-[#1a1a1a] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-medium bg-[#22c55e] text-[#000000] border border-[#22c55e] hover:bg-[#16a34a] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          Rate limiting, <br /> as a service.
        </h1>
        <p className="text-xl text-[#888888] mb-10 max-w-2xl">
          Protect any API in 3 lines of code. Enterprise-grade rate limiting without the infrastructure overhead.
        </p>
        <Link
          href="/sign-up"
          className="px-6 py-3 text-base font-medium bg-[#22c55e] text-[#000000] border border-[#22c55e] hover:bg-[#16a34a] transition-colors mb-16"
        >
          Get Started Free
        </Link>

        {/* Code Snippet Block */}
        <div className="w-full max-w-2xl text-left border border-[#222222] bg-[#111111] p-6 text-sm font-mono text-zinc-300 overflow-x-auto leading-relaxed">
          <p><span className="text-[#888888]">import</span> {"{ Throttlr }"} <span className="text-[#888888]">from</span> <span className="text-[#22c55e]">"throttlr-sdk"</span></p>
          <br />
          <p><span className="text-[#888888]">const</span> limiter <span className="text-[#888888]">= new</span> Throttlr({"{ apiKey: "} <span className="text-[#22c55e]">"your-api-key"</span> {"}"})</p>
          <p><span className="text-[#888888]">await</span> limiter.check({"{ identifier: "} req.user.id {"}"})</p>
        </div>

        {/* Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full text-left">
          <div className="border border-[#222222] bg-[#111111] p-6">
            <LayoutDashboard className="w-6 h-6 mb-4 text-white" />
            <h3 className="text-lg font-semibold mb-2">Any Algorithm</h3>
            <p className="text-[#888888] text-sm leading-relaxed">
              Choose between Sliding Window, Token Bucket, or Fixed Window to perfectly match your traffic patterns.
            </p>
          </div>
          <div className="border border-[#222222] bg-[#111111] p-6">
            <Shield className="w-6 h-6 mb-4 text-white" />
            <h3 className="text-lg font-semibold mb-2">Visual Dashboard</h3>
            <p className="text-[#888888] text-sm leading-relaxed">
              Monitor allowed and blocked requests in real-time. Full visibility into your API consumption.
            </p>
          </div>
          <div className="border border-[#222222] bg-[#111111] p-6">
            <Key className="w-6 h-6 mb-4 text-white" />
            <h3 className="text-lg font-semibold mb-2">One SDK</h3>
            <p className="text-[#888888] text-sm leading-relaxed">
              Integrate flawlessly within seconds. Our universal SDK supports major JavaScript runtimes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222222] bg-[#0a0a0a] py-8 text-center text-sm text-[#888888] flex flex-col items-center">
        <div className="font-bold text-white mb-2 tracking-tight">Throttlr</div>
        <p>© {new Date().getFullYear()} Throttlr Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
