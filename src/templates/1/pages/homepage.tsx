import WorkingHours from "../components/sections/working-hours";
import HeroSection from "../components/sections/hero-section";
import Services from "../components/sections/services";
import Categories from "../components/sections/categories";
import { userWithSite } from "@/lib/api/users";
import { getAvailableTime } from "@/lib/utils";
import { getAllServices } from "@/lib/api/services";
import { getAllCategories } from "@/lib/api/categories";

const Home1 = async ({ site }: { site: string }) => {
  const user = await userWithSite(site, {
    siteSettings: {
      select: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
        phone: true,
      },
    },
  });
  const siteSettings = user?.siteSettings && user.siteSettings[0];
  const services = await getAllServices(site, { limit: 8 });
  const categories = await getAllCategories(site, { limit: 8 });

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
      <Services services={services.records} />
      <WorkingHours workingHours={workingHours} phone={siteSettings?.phone} />
      <Categories categories={categories.records} />
    </>
  );
};

export default Home1;
