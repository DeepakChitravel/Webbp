"use client";

import { currentCustomer } from "@/lib/api/customers";
import { Customer } from "@/types";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  user: Customer | null;
  loading: boolean;
  login: (userData: Customer | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER FROM TOKEN
  ========================= */
useEffect(() => {
  async function getCustomer() {
    console.log("🔄 AuthProvider mounted → checking token");

    try {
      const res = await currentCustomer();

      console.log("📥 token.php response:", res);

  if (res && res.customer_id) {
  console.log("✅ User restored from token:", res);
  setUser(res);
} else {
  console.warn("❌ No user from token");
  setUser(null);
}

    } catch (err) {
      console.error("🔥 token.php error:", err);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("⏹ Auth check finished");
    }
  }

  getCustomer();
}, []);

  /* =========================
     LOGIN (OPTIONAL USE)
  ========================= */
  const login = (userData: Customer | null) => {
    setUser(userData);
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    setUser(null);
    deleteCookie("token", { path: "/" }); // ✅ FIX
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
