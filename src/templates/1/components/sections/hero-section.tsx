import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Search from "../forms/search";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "@/link";
import { ChevronRight } from "lucide-react";

const avatars = [
  {
    name: "Muawiyah",
    img: "https://avatars.githubusercontent.com/u/115263823",
  },
  {
    name: "Arun Raj",
    img: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  },
  {
    name: "Ibraheem",
    img: "https://cdn-icons-png.flaticon.com/512/4140/4140039.png",
  },
  {
    name: "Yazeed",
    img: "https://cdn-icons-png.flaticon.com/512/4140/4140061.png",
  },
];

const HeroSection = () => {
  return (
    <section className="lg:min-h-[900px] py-8 bg-[url('/templates/1/hero-bg.jpg')] bg-no-repeat bg-cover bg-center flex items-center">
      <div className="container">
        <div className="2xl:flex items-center justify-between gap-10">
          <div className="2xl:w-1/2">
            <h1 className="text-secondary lg:text-6xl text-4xl leading-[50px] sm:text-5xl sm:leading-[60px] font-bold lg:leading-[80px]">
              For All Your <br /> Big And Small Repair <br /> & Maintenance
              Needs
            </h1>

            <p className="text-gray-500 text-lg mt-4 leading-[32px] mb-10">
              Collaboratively administrate empowered markets via plug-and-play
              networks, dynamically procrastinate B2C users after installed.
            </p>

            <Search />

            <div className="mt-8 flex items-center gap-10 justify-between">
              <Link href="/">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full pr-1 text-white gap-4"
                >
                  Book an Appointment
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <ChevronRight />
                  </span>
                </Button>
              </Link>

              <div className="hidden lg:flex items-center justify-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  {avatars.map((avatar, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={avatar.img} />
                            <AvatarFallback className="bg-white">
                              {getInitials(avatar.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{avatar.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>

                <span className="text-lg font-medium">20k+ Happy Client</span>
              </div>
            </div>
          </div>

          <div className="2xl:w-1/2 2xl:flex hidden items-center justify-end">
            <div className="shadow-[7px_7px] shadow-primary/50 h-[700px] w-[580px] rounded-lg">
              <Image
                src="/templates/1/hero-img.jpg"
                alt=""
                width={800}
                height={800}
                unoptimized
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
