"use server";

import { apiUrl } from "@/config";
import axios from "axios";
import { cookies } from "next/headers";
import {
  RegisterData,
  UpdateCustomerData,
  customerLoginData,
  sendOtpData,
} from "@/types";

// REGISTER
export const registerCustomer = async (data: RegisterData) => {
  const url = `${apiUrl}/customers/register.php`;

  try {
    const response = await axios.post(url, data);
    return { success: true, ...response.data };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Registration failed",
    };
  }
};

// SEND OTP (DEV MODE → 111111)
export const sendOtp = async (data: sendOtpData) => {
  const url = `${apiUrl}/customers/send-otp.php`;

  try {
    const response = await axios.post(url, data);

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

// CURRENT CUSTOMER
export const currentCustomer = async () => {
  const token = cookies().get("token")?.value;

  try {
    const response = await axios.get(
      `${apiUrl}/customers/token.php`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch {
    return null;
  }
};

// LOGIN
export const loginCustomer = async (data: customerLoginData) => {
  try {
    const response = await axios.post(
      `${apiUrl}/customers/login.php`,
      data
    );
    return { success: true, ...response.data };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Login failed",
    };
  }
};

// UPDATE PROFILE
export const updateCustomer = async ({
  id,
  data,
}: UpdateCustomerData) => {
  try {
    const response = await axios.post(
      `${apiUrl}/customers/update.php?id=${id}`,
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

export const verifyOtp = async (data: any) => {
  try {
    const res = await axios.post(
      `${apiUrl}/customers/verify-otp.php`,
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
