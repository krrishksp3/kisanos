"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Globe, LogOut, Sprout, Store, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useCurrentUser, useNotifications } from "@/hooks/useQueries";
import { api } from "@/lib/api";

export function TopBar() {
  const { lang, toggleLang, t } = useLanguage();
  const { data: user } = useCurrentUser();
  const { data: notifs } = useNotifications();
  const router = useRouter();

  const handleLogout = () => {
    api.auth.logout();
    router.push("/login");
  };

  const unreadCount = notifs?.unread_count || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-agri-700 flex items-center justify-center text-white shadow-sm group-hover:bg-agri-800 transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-slate-900 leading-tight block">
              {t.appName}
            </span>
            <span className="text-[11px] font-medium text-agri-700 leading-none hidden sm:block">
              {lang === "hi" ? "मिट्टी से मंडी तक" : "From Soil to Sale"}
            </span>
          </div>
        </Link>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-700">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-agri-800">
            {t.nav.home}
          </Link>
          <Link href="/farm" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-agri-800">
            {t.nav.farm}
          </Link>
          <Link href="/advisor" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-agri-800">
            {t.nav.advisor}
          </Link>
          <Link href="/stores" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-agri-800 flex items-center gap-1">
            <Store className="w-4 h-4" />
            {t.nav.stores}
          </Link>
          <Link href="/harvest" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-agri-800 flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" />
            {t.nav.harvest}
          </Link>
          <Link href="/market" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-agri-800">
            {t.nav.market}
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-colors active:scale-95"
            title="भाषा बदलें (Toggle Language)"
          >
            <Globe className="w-4 h-4 text-agri-700" />
            <span>{lang === "hi" ? "English" : "हिन्दी"}</span>
          </button>

          {/* Notifications Button with Badge */}
          <Link
            href="/dashboard#notifications"
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
            title={t.nav.notifications}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Farmer Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title={user.name}
              >
                <div className="w-8 h-8 rounded-full bg-earth-100 border border-earth-300 text-earth-800 font-bold flex items-center justify-center text-xs">
                  {user.name.slice(0, 1)}
                </div>
                <span className="font-semibold text-sm text-slate-800 hidden lg:inline max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title={t.auth.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-lg shadow-xs"
            >
              {t.auth.loginButton}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
