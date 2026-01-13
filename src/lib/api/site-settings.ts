import axios from "axios";
import { apiUrl } from "@/config";

export const getSiteSettings = async (userId: number) => {
  try {
    // Try endpoint 1
    const response = await axios.get(
      `${apiUrl}/public/site-settings/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    try {
      // Try endpoint 2 (fallback)
      const response = await axios.get(
        `${apiUrl}/seller/settings/get-site-settings.php?user_id=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error('Error fetching site settings:', err);
      return null;
    }
  }
};