// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { Icon } from "../sidebar/Icons";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-bg lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50"
            aria-label="Abrir menu"
          >
            {Icon.menu}
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-bold text-slate-800">
              Red de Seguridad Vecinal
            </p>
            <p className="text-xs text-slate-500">Demo frontend</p>
          </div>
          <div className="h-10 w-10" aria-hidden="true" />
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
