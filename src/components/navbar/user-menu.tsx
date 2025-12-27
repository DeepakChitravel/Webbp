"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadsUrl } from "@/config";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const avatarLetter = user.name?.charAt(0)?.toUpperCase();

  return (
    <div className="relative">
      {/* Avatar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold focus:outline-none"
      >
        {user.photo ? (
          <img
            src={`${uploadsUrl}/${user.photo}`}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          avatarLetter
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl border z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-4 py-3 border-b">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.phone}</p>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
          >
            <User size={16} />
            Profile
          </Link>

          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
