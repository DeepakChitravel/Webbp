"use client";
import Link from "@/link";
import NextLink from "next/link";
import { useParams, usePathname } from "next/navigation";
import { PhoneCall, ChevronRight, User } from "lucide-react";
import { Button } from "../ui/button";
import MobileMenu from "./mobile-menu";
import { NavbarProps } from "@/types";
import { formatPhoneNumber } from "react-phone-number-input";
import { uploadsUrl } from "@/config";
import Logo from "@/components/logo";
import LoginDialog from "../dialogs/login";
import RegisterDialog from "../dialogs/register";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./../../../../components/navbar/user-menu";




const Navbar = ({
  topbarInformations,
  phone,
  logo,
  siteName,
  navLinks,
}: NavbarProps) => {
  const pathname = usePathname();
  const { site } = useParams();

  const { user } = useAuth();

  return (
    <>
      {/* Topbar */}
      <div className="bg-secondary text-white py-5">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-5">
            {/* Left */}
            <ul className="flex items-center flex-wrap lg:divide-x divide-gray-600 lg:[&_li]:px-4 gap-3">
              {topbarInformations?.map(
                (item, index) =>
                  item.label && (
                    <li className="flex gap-2 text-sm" key={index}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="flex items-center gap-2"
                        >
                          <span className="text-primary [&_svg]:w-[19px] [&_svg]:h-[19px]">
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      ) : (
                        <>
                          <span className="text-primary [&_svg]:w-[19px] [&_svg]:h-[19px]">
                            {item.icon}
                          </span>
                          {item.label}
                        </>
                      )}
                    </li>
                  )
              )}
            </ul>

            {/* Right */}
        <div className="flex items-center gap-3 text-sm">
  {!user ? (
    <>
      <LoginDialog className="flex items-center gap-2">
        <User size={22} />
        <span>Sign In</span>
      </LoginDialog>

      <span>/</span>

      <RegisterDialog className="flex items-center gap-2">
        <span>Sign Up</span>
      </RegisterDialog>
    </>
  ) : (
    <UserMenu />
  )}
</div>

          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white py-5">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo imgUrl={`${uploadsUrl}/${logo}`} name={siteName} />
            </Link>
            <MobileMenu navLinks={navLinks} />

            <ul className="hidden lg:flex items-center gap-7">
              {navLinks?.map((item, index) => {
                let link = "/" + site;
                if (item.link !== "/") link += item.link;

                return (
                  <li key={index}>
                    <NextLink
                      href={item.link}
                      className={`${
                        pathname === link &&
                        "text-primary relative before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full before:absolute before:-bottom-3 before:left-[50%] before:-translate-x-[50%]"
                      } font-medium transition hover:text-primary`}
                    >
                      {item.label}
                    </NextLink>
                  </li>
                );
              })}
            </ul>

            <div className="hidden lg:flex items-center divide-x [&>*]:px-6">
              <div className="hidden 2xl:flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary/20"></div>
                  <div className="bg-primary w-11 h-11 rounded-full absolute top-[50%] left-[50%] -translate-y-[50%] -translate-x-[50%] flex items-center justify-center text-white">
                    <PhoneCall width={20} height={20} />
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-gray-500 uppercase">
                    Call Us Today
                  </span>
                  <NextLink
                    href={`tel:${phone}`}
                    className="block font-medium mt-1"
                  >
                    {formatPhoneNumber(phone)}
                  </NextLink>
                </div>
              </div>

              <Link href="/services">
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
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
