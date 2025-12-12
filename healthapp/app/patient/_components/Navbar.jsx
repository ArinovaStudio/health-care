'use client';
import React, { useState } from "react";
import { User, AlertTriangle, FileTextIcon, Menu, X, Shield, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import useUserStore from "@/app/store/useStore";
import toast from "react-hot-toast";
import { logOutAction } from "@/app/actions/auth";

const sections = [
  { name: "Health Profile", icon: <User />, link: "/patient" },
  { name: "Medical Records", icon: <FileTextIcon />, link: "/records" },
  { name: "Medication Prescribed", icon: <AlertTriangle />, link: "/medication" },
  { name: "Emergency Access", icon: <FileTextIcon />, link: "/emergencyAccess" },
];

export default function SidebarLayout({ children, activeSection }) {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (section) => {
    router.push(section.link);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const res = await logOutAction(currentUser);
      if (res.success) {
        toast.success("Logout Successfully")
        useUserStore.getState().clearUser();
        router.push('/');
      }
    } catch (error) {
      console.log(error)
      toast.error("Unable to Logout")
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOP NAVBAR */}
      <header className="w-full bg-white shadow-lg border-b px-4 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3 font-semibold text-xl text-teal-500">
          <span><Shield /></span>
          <span className="">MediLink</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-gray-600">
            {currentUser?.personalInfo.email || "Not Logged In"}
          </span>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-2 flex gap-3 text-gray-500 hover:text-red-500 cursor-pointer"
            >
              <p className="hidden md:block">Log Out</p>
              <span> <LogOut /></span>
            </button>
          )}

          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 bg-black/40 z-[90] transition duration-300 md:hidden ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`absolute top-0 left-0 h-full w-64 bg-white p-4 shadow-xl transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-gray-100 mb-6"
          >
            <X />
          </button>

          <nav className="flex flex-col gap-3">
            {sections.map((s) => (
              <div
                key={s.name}
                onClick={() => handleNavigation(s)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeSection === s.name
                    ? "bg-teal-50 ring-2 ring-teal-300"
                    : "hover:bg-gray-100"
                  }`}
              >
                {s.icon}
                <p className="text-md font-medium">{s.name}</p>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl w-full mx-auto flex gap-6 mt-6 px-4">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-64 bg-white shadow-lg rounded-xl p-4 h-fit sticky top-24">
          <nav className="flex flex-col gap-3">
            {sections.map((s) => (
              <div
                key={s.name}
                onClick={() => handleNavigation(s)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeSection === s.name
                    ? "bg-teal-50 ring-2 ring-teal-300"
                    : "hover:bg-gray-100"
                  }`}
              >
                <div className="text-teal-600">{s.icon}</div>
                <span className="font-medium">{s.name}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}