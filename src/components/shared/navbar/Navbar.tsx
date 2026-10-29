"use client";
import { useState } from "react";
import blue_logo from "@/assets/images/logo_blue.png";
import white_log from "@/assets/images/Logo_white.png";
import Container from "../container/Container";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import NavLinks from "./NavLinks";
import NavDropdown from "./NavDropdown";
import NavButton from "./NavButton";
import { useAppSelector } from "@/redux/hooks";

const navClassVariant = {
  colored: "bg-black text-primary-foreground",
  transparent: " border border-white/20 bg-white/10 backdrop-blur-[6px]",
};

type TProps = {
  className?: string;
  variant?: "colored" | "transparent";
  authPage?: boolean;
};

type NavLink = {
  label: string;
  path: string;
  dropdown?: { label: string; path: string }[];
};

export default function Navbar({
  className,
  variant = "colored",
  authPage = false,
}: TProps) {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const navLinks = () => {
    if (user) {
      return [
        { label: "Home", path: "/home" },
        {
          label: "Browse List",
          path: "/properties-list",
          dropdown: [
            { label: "Browse List", path: "/properties-list" },
            { label: "Browse Map", path: "/properties-map" },
          ],
        },
        {
          label: "My Offers",
          path: "/my-offer",
        },
        { label: "About Us", path: "/about-us" },
        { label: "FAQ", path: "/faqs" },
        { label: "Contact Us", path: "/contact-us" },
      ];
    }

    return [
      { label: "Home", path: "/home" },
      {
        label: "Browse List",
        path: "/properties-list",
        dropdown: [
          { label: "Browse List", path: "/properties-list" },
          { label: "Browse Map", path: "/properties-map" },
        ],
      },
      { label: "About Us", path: "/about-us" },
      { label: "FAQ", path: "/faqs" },
      { label: "Contact Us", path: "/contact-us" },
    ];
  };

  return (
    <Container
      className={cn("w-full flex items-center justify-between ", className)}
    >
      {/* ========================== logo + desktop nav links ============================ */}
      <div className={cn("flex items-center 2xl:gap-x-12 gap-8" )}>
        <Link href="/">
          {variant === "colored" ? (
            <Image
              src={blue_logo}
              alt="logo"
              className="max-w-20 sm:max-w-25"
            />
          ) : (
            <Image
              src={white_log}
              alt="logo"
              className="max-w-20 sm:max-w-none"
            />
          )}
        </Link>
        <div
          className={cn(
            "hidden lg:flex items-center py-2 px-4 text-white/80 rounded-full text-sm",
            authPage && "hidden",
            variant === "colored"
              ? navClassVariant.colored
              : navClassVariant.transparent,
          )}
        >
          {navLinks().map((link) =>
            link.dropdown ? (
              <NavDropdown
                key={link.label}
                label={link.label}
                items={link.dropdown}
              />
            ) : (
              <NavLinks key={link.label} link={link} />
            ),
          )}
        </div>
      </div>

      {/* ========================== desktop buttons ============================ */}
      <div className="hidden lg:flex">
        <NavButton setOpen={setOpen} authPage={authPage} />
      </div>

      {/* ========================== mobile trigger ============================ */}
      <div className="flex lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "rounded-full",
                variant === "colored"
                  ? "text-black/70 hover:bg-white/10"
                  : "text-white hover:bg-white/20",
              )}
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-70 sm:w-[320px]">
            <SheetHeader>
              <SheetTitle>
                <Image src={blue_logo} alt="logo" className="max-w-20" />
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-1 px-4 mt-6">
              {navLinks().map((link) =>
                link.dropdown ? (
                  <div key={link.label} className="flex flex-col border-b">
                    <span className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wide text-center border-b">
                      {link.label}
                    </span>
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setOpen(false)}
                        className="px-6 py-2 text-sm text-primary-black hover:text-primary-color transition-colors text-center "
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <NavLinks key={link.label} link={link} />
                ),
              )}
            </div>

            {!authPage && <NavButton setOpen={setOpen} />}
          </SheetContent>
        </Sheet>
      </div>
    </Container>
  );
}
