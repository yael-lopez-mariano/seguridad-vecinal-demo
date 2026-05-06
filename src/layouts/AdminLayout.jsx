// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-bg grid grid-cols-[auto_1fr]">
      <Sidebar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
