import HeroSection from "../components/sections/hero-section";
import Services from "../components/sections/services";
import Categories from "../components/sections/categories";
import WorkingHours from "../components/sections/working-hours";
import HomepageBooking from "../components/sections/homepage-booking";

import { userWithSite } from "@/lib/api/users";
import { getAvailableTime } from "@/lib/utils";
import { getAllServices } from "@/lib/api/services";
import { getAllCategories } from "@/lib/api/categories";

const Home1 = async ({ site }: { site: string }) => {
  /* =========================
     FETCH SELLER BASIC INFO
  ========================= */
  const user = await userWithSite(site, {
    siteSettings: {
      select: {
        monday: true,
        mondayStarts: true,
        mondayEnds: true,

        tuesday: true,
        tuesdayStarts: true,
        tuesdayEnds: true,

        wednesday: true,
        wednesdayStarts: true,
        wednesdayEnds: true,

        thursday: true,
        thursdayStarts: true,
        thursdayEnds: true,

        friday: true,
        fridayStarts: true,
        fridayEnds: true,

        saturday: true,
        saturdayStarts: true,
        saturdayEnds: true,

        sunday: true,
        sundayStarts: true,
        sundayEnds: true,

        phone: true,
      },
    },
  });

  // 🔥 THIS IS THE ONLY ID YOU MUST USE
  const sellerUserId = user?.user_id;

  // Server-side log → shows in TERMINAL
  console.log("SELLER USER ID:", sellerUserId);

  const siteSettings = user?.siteSettings?.[0];

  const services = await getAllServices(site, { limit: 8 });
  const categories = await getAllCategories(site, { limit: 8 });

  /* =========================
     WORKING HOURS
  ========================= */
  const workingHours = [
    {
      day: "Monday",
      time: getAvailableTime(
        "monday",
        siteSettings?.monday,
        siteSettings?.mondayStarts,
        siteSettings?.mondayEnds
      ),
    },
    {
      day: "Tuesday",
      time: getAvailableTime(
        "tuesday",
        siteSettings?.tuesday,
        siteSettings?.tuesdayStarts,
        siteSettings?.tuesdayEnds
      ),
    },
    {
      day: "Wednesday",
      time: getAvailableTime(
        "wednesday",
        siteSettings?.wednesday,
        siteSettings?.wednesdayStarts,
        siteSettings?.wednesdayEnds
      ),
    },
    {
      day: "Thursday",
      time: getAvailableTime(
        "thursday",
        siteSettings?.thursday,
        siteSettings?.thursdayStarts,
        siteSettings?.thursdayEnds
      ),
    },
    {
      day: "Friday",
      time: getAvailableTime(
        "friday",
        siteSettings?.friday,
        siteSettings?.fridayStarts,
        siteSettings?.fridayEnds
      ),
    },
    {
      day: "Saturday",
      time: getAvailableTime(
        "saturday",
        siteSettings?.saturday,
        siteSettings?.saturdayStarts,
        siteSettings?.saturdayEnds
      ),
    },
    {
      day: "Sunday",
      time: getAvailableTime(
        "sunday",
        siteSettings?.sunday,
        siteSettings?.sundayStarts,
        siteSettings?.sundayEnds
      ),
    },
  ];

  return (
    <>
      <HeroSection />

      {/* 🔥 PASS sellerUserId ONLY */}
      <HomepageBooking userId={sellerUserId} />

      <Services services={services.records} />

      <WorkingHours
        workingHours={workingHours}
        phone={siteSettings?.phone}
      />

      <Categories categories={categories.records} />
    </>
  );
};

export default Home1;
