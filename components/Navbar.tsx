"use client";

import React from "react";
import { WindIcon } from "./Icons";

export type DashboardTab = "overview" | "advisor" | "actions" | "lifestyle" | "methodology" | "all";

interface NavbarProps {
  activeTab?: DashboardTab;
  onSelectTab?: (tab: DashboardTab) => void;
}

export function Navbar({ activeTab, onSelectTab }: NavbarProps) {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: DashboardTab, targetId: string) => {
    e.preventDefault();
    if (onSelectTab) {
      onSelectTab(tab);
    }
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20">
            <WindIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">SmogSense</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500">Urban Air Quality &amp; Daily Action Guide</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600">
            <a
              href="#summary"
              onClick={(e) => handleNavClick(e, "overview", "summary")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${activeTab === "overview" ? "text-emerald-700 bg-emerald-50 font-bold" : "hover:text-emerald-700 hover:bg-slate-50"}`}
            >
              Overview &amp; Forecast
            </a>
            <a
              href="#recommendations"
              onClick={(e) => handleNavClick(e, "advisor", "recommendations")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${activeTab === "advisor" ? "text-emerald-700 bg-emerald-50 font-bold" : "hover:text-emerald-700 hover:bg-slate-50"}`}
            >
              Advisory &amp; Plan
            </a>
            <a
              href="#actions"
              onClick={(e) => handleNavClick(e, "actions", "actions")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${activeTab === "actions" ? "text-emerald-700 bg-emerald-50 font-bold" : "hover:text-emerald-700 hover:bg-slate-50"}`}
            >
              Action Checklist
            </a>
            <a
              href="#swaps"
              onClick={(e) => handleNavClick(e, "lifestyle", "swaps")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${activeTab === "lifestyle" ? "text-emerald-700 bg-emerald-50 font-bold" : "hover:text-emerald-700 hover:bg-slate-50"}`}
            >
              Home &amp; Swaps
            </a>
            <a
              href="#methodology"
              onClick={(e) => handleNavClick(e, "methodology", "methodology")}
              className={`px-3 py-1.5 rounded-xl transition-colors ${activeTab === "methodology" ? "text-emerald-700 bg-emerald-50 font-bold" : "hover:text-emerald-700 hover:bg-slate-50 text-slate-500"}`}
            >
              Data Sources
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
