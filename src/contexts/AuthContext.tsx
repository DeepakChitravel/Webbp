"use client";
import { currentCustomer } from "@/lib/api/customers";
import { Customer } from "@/types";
import { deleteCookie } from "cookies-next";
import { useParams, useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  user: Customer | null | undefined;
  login: (userData: Customer | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { site } = useParams();

  const [user, setUser] = useState<Customer | null | undefined>(undefined);

  useEffect(() => {
    async function getCustomer() {
      const customerData = await currentCustomer();
      if (!user && customerData) {
        setUser(customerData);
      }

      if (!customerData) {
        setUser(null);
        return;
      }
    }
    getCustomer();
  }, []);

  const login = (userData: Customer | null) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    deleteCookie("token", { path: "/" + site });
    router.push("/" + site);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
