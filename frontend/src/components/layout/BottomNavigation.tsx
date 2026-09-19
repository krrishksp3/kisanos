"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sprout, MessageSquare, Camera, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Do not show bottom nav on login or onboarding pages
  if (pathname === "/login" || pathname === "/onboarding") {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: t.nav.home, icon: Home },
    { href: "/farm", label: t.nav.farm, icon: Sprout },
    { href: "/advisor", label: t.nav.advisor, icon: MessageSquare },
    { href: "/monitor", label: t.nav.monitor, icon: Camera },
    { href: "/market", label: t.nav.market, icon: TrendingUp },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 py-1.5 pb-safe">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all select-none min-h-[52px]",
                isActive
                  ? "text-agri-800 font-bold bg-agri-50"
                  : "text-slate-600 hover:text-slate-900 font-medium active:scale-95"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-agri-700 stroke-[2.5]" : "text-slate-500")} />
              <span className="text-[11px] leading-tight truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
