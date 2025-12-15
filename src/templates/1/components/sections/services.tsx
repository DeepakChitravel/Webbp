import getSymbolFromCurrency from "currency-symbol-map";
import { Service as ServiceProps } from "@/types";
import Service from "../cards/service";
import { uploadsUrl } from "@/config";

const Services = ({ services }: { services: ServiceProps[] }) => {
  return (
    <section className="lg:py-20 py-8 bg-[url('/templates/1/services-bg.jpg')] bg-no-repeat bg-cover bg-center">
      <div className="container">
        <h1 className="lg:text-5xl text-3xl sm:text-4xl font-bold text-center mb-12 lg:mb-20">
          See Our Services
        </h1>

        <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {services?.map((service, index: number) => {
            const siteSettings =
              service.user.siteSettings && service.user.siteSettings[0];

            return (
              <Service
                key={index}
                name={service.name}
                slug={service.slug}
                img={uploadsUrl + "/" + service.image}
                location=""
                price={{
                  price: parseInt(service.amount),
                  mrp: service.previousAmount
                    ? parseInt(service.previousAmount)
                    : undefined,
                }}
                currency={
                  getSymbolFromCurrency(
                    siteSettings?.currency as string
                  ) as string
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
