"use client";

import { useState } from "react";
import { loginCustomer } from "@/lib/api/customers";
import { useRouter, useParams } from "next/navigation";
import { setCookie } from "cookies-next";

export default function LoginPage() {
  const router = useRouter();
  const { site } = useParams();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await loginCustomer(form);

    if (!res.success) {
      setError(res.message);
      return;
    }

    // save token
    setCookie("token", res.token, { path: `/${site}` });

    router.push(`/${site}`);
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-5">Login</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full border p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
