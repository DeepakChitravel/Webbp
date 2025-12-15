import { apiUrl } from "@/config";
import axios from "axios";

const route = "/website-settings";

// Get website settings data
export const websiteSettingsWithSlug = async (slug: string) => {
  const url = `${apiUrl + route}/site/${slug}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    return false;
  }
};
