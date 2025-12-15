import { apiUrl } from "@/config";
import axios from "axios";

const route = "/users";

// Get user data (seller website info)
export const userWithSite = async (slug: string) => {
  // Correct PHP file + correct query format
  const url = `${apiUrl}${route}/site.php?slug=${slug}`;

  try {
    const response = await axios.get(url);
    return response.data; // returns user or null
  } catch (error: any) {
    return false;
  }
};
