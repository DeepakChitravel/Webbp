// ❌ DO NOT USE "use server" HERE

import axios from "axios";
import { apiUrl } from "@/config";
import {
  RegisterData,
  UpdateCustomerData,
  customerLoginData,
  sendOtpData,
} from "@/types";

/* ===============================
   AXIOS INSTANCE (CLIENT SAFE)
================================ */
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ✅ allows cookies
});

/* ===============================
   REGISTER
================================ */
export const registerCustomer = async (data: RegisterData) => {
  try {
    const response = await api.post(
      "/customers/register.php",
      data
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Registration failed",
    };
  }
};

/* ===============================
   SEND OTP
================================ */
export const sendOtp = async (data: sendOtpData) => {
  try {
    const response = await api.post(
      "/customers/send-otp.php",
      data
    );

    return {
      success: true,
      message: response.data?.message || "OTP sent successfully",
      otp: response.data?.otp || "111111",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to send OTP",
    };
  }
};

/* ===============================
   LOGIN ✅ FIXED
================================ */
export const loginCustomer = async (data: customerLoginData) => {
  console.log("📤 LOGIN PAYLOAD:", data);
  console.log("🔑 LOGIN KEYS:", Object.keys(data));

  try {
    const response = await api.post(
      "/customers/login.php",
      data
    );

    console.log("📥 LOGIN RESPONSE:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "🔥 LOGIN ERROR:",
      error?.response?.data || error
    );

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Login failed",
    };
  }
};

/* ===============================
   CURRENT CUSTOMER
================================ */
export const currentCustomer = async () => {
  try {
    const response = await api.get(
      "/customers/token.php"
    );
    return response.data;
  } catch {
    return null;
  }
};

/* ===============================
   UPDATE CUSTOMER
================================ */
export const updateCustomer = async ({
  id,
  data,
}: UpdateCustomerData) => {
  try {
    const response = await api.post(
      `/customers/update.php?id=${id}`,
      data
    );
    return { success: true, ...response.data };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Update failed",
    };
  }
};

/* ===============================
   VERIFY OTP
================================ */
export const verifyOtp = async (data: any) => {
  try {
    const res = await api.post(
      "/customers/verify-otp.php",
      data
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "OTP verification failed",
    };
  }
};
