"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, Key, ScrollText, LogOut } from "lucide-react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import clsx from "clsx";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "Rules", href: "/rules", icon: Shield },
    { name: "API Keys", href: "/api-keys", icon: Key },
    { name: "Logs", href: "/logs", icon: ScrollText },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#222222] bg-[#111111] flex flex-col pt-6">
        <div className="px-6 mb-8">
          <Link href="/overview" className="font-bold text-xl tracking-tight text-white hover:opacity-80 transition-opacity">
            Throttlr
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors border",
                    isActive
                      ? "bg-[#111111] border-transparent border-l-[#22c55e] text-[#22c55e]"
                      : "border-transparent text-[#888888] hover:bg-[#1a1a1a] hover:text-[#22c55e]"
                  )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User context footer */}
        <div className="p-4 border-t border-[#222222] mt-auto flex flex-col gap-3 pb-6">
          <div className="px-2 truncate text-sm text-[#888888]">
            {user?.primaryEmailAddress?.emailAddress || "Loading..."}
          </div>
          <SignOutButton>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 border border-transparent hover:bg-[#1a1a1a] hover:border-[#222222] transition-colors text-left">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
