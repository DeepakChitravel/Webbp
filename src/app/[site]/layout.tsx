import { AuthProvider } from "@/contexts/AuthContext";
import { getAllCategories } from "@/lib/api/categories";
import { userWithSite } from "@/lib/api/users";
import { getAvailableTime } from "@/lib/utils";
import { Navbar, Footer } from "@/components";
import { format } from "date-fns";
import { Clock, Mail, MapPin } from "lucide-react";
import { websiteSettingsWithSlug } from "@/lib/api/website-settings";
import { headers } from "next/headers";

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { site: string };
}>) {

  // Get the current requested path
  const pathname = headers().get("x-invoke-path") || "";

  // Routes that do NOT need site data
  const publicRoutes = ["/register", "/login"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.endsWith(route)
  );

  // If visiting login/register → no need to fetch site/seller data
  if (isPublicRoute) {
    return (
      <main className="bg-white min-h-screen">
        {children}
      </main>
    );
  }

  // Fetch the seller site info
  const user = await userWithSite(params.site);

  // If the site is invalid → show clean message
  if (!user) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold">Site not found</h2>
      </main>
    );
  }

  const siteSettings = user.siteSettings?.[0] || {};

  // Determine today's schedule safely
  const day = format(new Date(), "eeee").toLowerCase();

  const time =
    siteSettings[day] !== undefined
      ? getAvailableTime(
          format(new Date(), "eeee"),
          siteSettings[day],
          siteSettings[day + "Starts"],
          siteSettings[day + "Ends"]
        )
      : "Closed";

  // Fetch website navigation settings
  const websiteSettings = await websiteSettingsWithSlug(params.site);

  // Fetch categories
  const categories = await getAllCategories(params.site, { limit: 8 });

  return (
    <AuthProvider>
      <Navbar
        topbarInformations={[
          {
            icon: <Mail />,
            label: siteSettings.email || "",
            href: `mailto:${siteSettings.email || ""}`,
          },
          {
            icon: <Clock />,
            label: time,
          },
          {
            icon: <MapPin />,
            label: siteSettings.address || "",
          },
        ]}
        phone={siteSettings.phone || ""}
        logo={siteSettings.logo || ""}
        siteName={user.siteName}
        navLinks={websiteSettings.navLinks || []}
      />

      <main className="overflow-x-hidden bg-white min-h-[calc(100vh_-_572px)]">
        {children}
      </main>

      <Footer user={user} categories={categories.records || []} />
    </AuthProvider>
  );
}
