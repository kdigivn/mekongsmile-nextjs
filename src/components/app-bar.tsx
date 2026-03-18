/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import {
  CircularProgress,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import LinkBase from "./link-base";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MdOutlineAccountCircle } from "react-icons/md";
import {
  ChildItem,
  Menus,
} from "@/services/infrastructure/wordpress/types/menu";
import { Logo } from "@/services/infrastructure/wordpress/types/logo";
import { cn, formatCurrency } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

import { Post } from "@/services/infrastructure/wordpress/types/post";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Trigger } from "@radix-ui/react-navigation-menu";
import { useSearchDialogActions } from "./search/context/use-search-dialog-actions";
import { useSearchDialog } from "./search/context/use-search-dialog";
import { IoIosMenu, IoMdClose } from "react-icons/io";
import { IoShareSocialOutline } from "react-icons/io5";
import { BiSearchAlt } from "react-icons/bi";
import { useMobileBottomNavActions } from "./footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";
import dynamic from "next/dynamic";
import Profile from "./profile/profile";
import ChangePassword from "./profile/change-password";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContactHeaderIconsItem } from "@/services/infrastructure/wordpress/types/sideBar";
import SupportContactForm from "./form/support-contact-form";
import TopUpDialog from "./dialog/top-up-dialog";
import ShowSuggestionVoucherDialog from "./dialog/show-suggestion-voucher-dialog";
// import UserNotification from "./user-notification";
// import GoogleTranslate from "./google-translate/google-translate";
// import Search from "./search/search";

type Props = {
  mainMenu: Menus;
  mobileMenu: Menus;
  logoData: Logo;
  highLightPosts: Post[];
  contactHeaderIcons: ContactHeaderIconsItem[];
  displayVoucherSuggestion: boolean;
};

const UserNotification = dynamic(() => import("./user-notification"), {
  ssr: false,
});
const Search = dynamic(() => import("./search/search"), { ssr: false });
const GoogleTranslate = dynamic(
  () => import("./google-translate/google-translate"),
  { ssr: false }
);

const ResponsiveAppBar = ({
  mainMenu,
  mobileMenu,
  logoData,
  highLightPosts,
  contactHeaderIcons,
  displayVoucherSuggestion,
}: Props) => {
  const { t } = useTranslation("common");
  const { user, isAuthenticated } = useAuth();
  const { logOut } = useAuthActions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { hideNav, showNav } = useMobileBottomNavActions();
  const pathname = usePathname();
  const language = useLanguage();

  const { toggleOpen } = useSearchDialogActions();

  const handleCloseNavMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleSearch = useCallback(() => toggleOpen(), [toggleOpen]);

  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);

  const toggleTopUpDialog = useCallback(() => {
    setIsTopUpDialogOpen(!isTopUpDialogOpen);
  }, [isTopUpDialogOpen]);

  const navClassNames = useMemo(
    () => ({
      wrapper: [
        "max-w-screen-xl",
        "gap-0",
        "flex",
        "flex-col",
        "!h-full",
        "px-5",
        "md:px-10",
      ],
      menu: ["z-[99]"],
      item: [
        "flex",
        "relative",
        "h-full",
        "items-center",
        "data-[active=true]:after:content-['']",
        "data-[active=true]:after:absolute",
        "data-[active=true]:after:bottom-0",
        "data-[active=true]:after:left-0",
        "data-[active=true]:after:right-0",
        "data-[active=true]:after:h-[2px]",
        "data-[active=true]:after:rounded-lg",
        "data-[active=true]:after:bg-primary",
      ],
      content: ["gap-3 md:gap-4"],
    }),
    []
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { isOpen: isSearchOpen } = useSearchDialog();

  const toggleProfile = useCallback(() => {
    setIsProfileOpen(!isProfileOpen);
  }, [isProfileOpen]);

  useEffect(() => {
    if (isProfileOpen || isChangePasswordOpen || isMenuOpen || isSearchOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [
    hideNav,
    isChangePasswordOpen,
    isMenuOpen,
    isProfileOpen,
    isSearchOpen,
    showNav,
  ]);

  // const toggleChangePassword = useCallback(() => {
  //   setIsChangePasswordOpen(!isChangePasswordOpen);
  // }, [isChangePasswordOpen]);

  // temporary take down for mega menu
  // let bottomMenuItems: React.ReactNode[] = [];
  // if (hasBottomMenu) {
  //   bottomMenuItems =
  //     bottomHeaderMenu?.menus.nodes[0].menuItems.nodes.map(
  //       (menuItem: ChildItem) => {
  //         const childItems = menuItem?.childItems?.nodes ?? [];
  //         if (childItems.length > 0) {
  //           return (
  //             <MegaMenuMain
  //               key={menuItem.id}
  //               name={menuItem?.label}
  //               listChild={childItems}
  //             />
  //           );
  //         } else {
  //           return (
  //             <LinkBase href={`/${menuItem.path}`} key={menuItem.id}>
  //               <NavbarItem className="text-sm">{menuItem.label}</NavbarItem>
  //             </LinkBase>
  //           );
  //         }
  //       }
  //     ) ?? [];
  // }

  // let bottomMenuItems: React.ReactNode[] = [];
  // if (hasBottomMenu) {
  //   bottomMenuItems =
  //     bottomHeaderMenu?.menus.nodes[0].menuItems.nodes.map(
  //       (menuItem: ChildItem, idx) => {
  //         const childItems = menuItem?.childItems?.nodes ?? [];
  //         if (childItems.length > 0) {
  //           return (
  //             <NavigationMenu key={idx}>
  //               <NavigationMenuList>
  //                 <NavigationMenuItem>
  //                   <NavigationMenuTrigger className="!bg-transparent !px-0 !font-normal">
  //                     {menuItem.label}
  //                   </NavigationMenuTrigger>
  //                   <NavigationMenuContent>
  //                     {childItems[0].childItems?.nodes.length ? (
  //                       <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
  //                         {childItems.map((component, idx) => (
  //                           <ListMenuItem component={component} key={idx} />
  //                         ))}
  //                       </ul>
  //                     ) : (
  //                       <ul className="grid min-w-[300px] gap-1 p-2">
  //                         {childItems.map((component) => (
  //                           <ListItem
  //                             key={component.id}
  //                             title={component.label}
  //                             href={
  //                               menuItem.path === "/posts"
  //                                 ? `${menuItem.path}${component.path}`
  //                                 : `${component.path}`
  //                             }
  //                           >
  //                             {/* {component.label} */}
  //                           </ListItem>
  //                         ))}
  //                       </ul>
  //                     )}
  //                   </NavigationMenuContent>
  //                 </NavigationMenuItem>
  //               </NavigationMenuList>
  //             </NavigationMenu>
  //           );
  //         } else {
  //           return (
  //             <NavigationMenu key={idx}>
  //               <NavigationMenuList>
  //                 <NavigationMenuItem>
  //                   <LinkBase href={menuItem.path} legacyBehavior passHref>
  //                     <NavigationMenuLink>{menuItem.label}</NavigationMenuLink>
  //                   </LinkBase>
  //                 </NavigationMenuItem>
  //               </NavigationMenuList>
  //             </NavigationMenu>
  //           );
  //         }
  //       }
  //     ) ?? [];
  // }

  // const themeSwitchFallback = useMemo(
  //   () => <Skeleton className="h-10 rounded-lg bg-neutral-200" />,
  //   []
  // );

  // Handle render menu item for mobile (Accordion)
  const renderMenuItems = (menuItems: ChildItem[], level = 0) => {
    if (menuItems && menuItems.length > 0) {
      return menuItems.map((menu: ChildItem) => {
        // Safely check if there are child items
        const hasChildren =
          menu?.childItems?.nodes && menu?.childItems?.nodes?.length > 0;

        if (hasChildren) {
          // Menu item with children: render as Accordion
          return (
            <AccordionItem
              key={menu.id}
              value={`item-${menu.id}`}
              className={cn(
                "w-full",
                level === 0 ? "border-b-1 border-default-400" : "border-none"
              )}
            >
              <div className="flex flex-row items-center gap-2 border-b-1 border-default-400">
                <NavbarMenuItem
                  key={menu.id}
                  isActive={pathname === `/${language}${menu.uri}`}
                  className={cn(
                    "w-full",
                    level === 0
                      ? "py-2"
                      : `ml-${level * 2} py-2 text-black hover:bg-primary-100`
                  )}
                >
                  <LinkBase onClick={handleCloseNavMenu} href={`${menu.uri}`}>
                    <p
                      className={`${level === 0 ? "font-semibold" : "font-medium"} text-sm leading-7 [&:not(:first-child)]:mt-6`}
                    >
                      {menu.label}
                    </p>
                  </LinkBase>
                </NavbarMenuItem>
                <AccordionTrigger
                  className={cn(
                    `w-full justify-start gap-2 py-2 text-left text-sm font-semibold leading-7 hover:text-primary hover:no-underline data-[state=open]:text-primary ml-${level * 2}`
                  )}
                >
                  {/* {menu.label} */}
                </AccordionTrigger>
              </div>
              <AccordionContent className="flex flex-col justify-start">
                {/* Recursively call renderMenuItems with the child items, increase the level */}
                {menu.childItems?.nodes &&
                  menu.childItems?.nodes.length > 0 &&
                  renderMenuItems(menu.childItems?.nodes ?? [], level + 1)}
              </AccordionContent>
            </AccordionItem>
          );
        } else {
          // Menu item without children: render as a simple link
          return (
            <NavbarMenuItem
              key={menu.id}
              isActive={pathname === `/${language}${menu.uri}`}
              className={cn(
                "w-full",
                level === 0
                  ? "border-b-1 border-default-400 py-2"
                  : `ml-${level * 2} py-2 text-black hover:bg-primary-100`
              )}
            >
              <LinkBase onClick={handleCloseNavMenu} href={`${menu.uri}`}>
                <p
                  className={`${level === 0 ? "font-semibold" : "font-medium"} text-sm leading-7 [&:not(:first-child)]:mt-6`}
                >
                  {menu.label}
                </p>
              </LinkBase>
            </NavbarMenuItem>
          );
        }
      });
    }
    return null;
  };

  const renderIcon = useCallback((isMenuOpen: boolean) => {
    return isMenuOpen ? (
      <IoMdClose className="h-6 w-6" />
    ) : (
      <IoIosMenu className="h-6 w-6" />
    );
  }, []); // Empty dependency array means the function is memoized and won't change

  let mainMenuItems: React.ReactNode[] = [];
  if (mainMenu) {
    mainMenuItems =
      mainMenu?.menus.nodes[0].menuItems.nodes.map(
        (menuItem: ChildItem, idx) => {
          const childItems = menuItem?.childItems?.nodes ?? [];
          if (childItems.length > 0) {
            return (
              <NavbarItem key={idx}>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="bg-transparent px-0 font-normal hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent data-[active]:text-primary data-[state=open]:text-primary">
                        {menuItem.uri ? (
                          <LinkBase
                            href={menuItem.uri}
                            className="text-sm font-normal hover:text-primary"
                          >
                            {menuItem.label}
                          </LinkBase>
                        ) : (
                          menuItem.label
                        )}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {childItems[0].childItems?.nodes.length ? (
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                            {childItems.map((component, idx) => (
                              <ListMenuItem component={component} key={idx} />
                            ))}
                          </ul>
                        ) : (
                          <ul className="grid min-w-[300px] gap-1 p-2">
                            {childItems.map((component) => (
                              <ListItem
                                key={component.id}
                                title={component.label}
                                href={component.uri}
                              >
                                {/* {component.label} */}
                              </ListItem>
                            ))}
                          </ul>
                        )}
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </NavbarItem>
            );
          } else {
            return (
              <NavbarItem key={idx}>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <LinkBase
                          href={menuItem.uri}
                          className="text-sm font-normal hover:text-primary"
                        >
                          {menuItem.label}
                        </LinkBase>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </NavbarItem>
            );
          }
        }
      ) ?? [];
  }

  // const themeSwitchFallback = useMemo(
  //   () => <Skeleton className="h-10 rounded-lg bg-neutral-200" />,
  //   []
  // );

  useEffect(() => {
    if (isMenuOpen) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, isMenuOpen, showNav]);

  const fullName =
    language === "en"
      ? `${user?.customer?.first_name || ""}${user?.customer?.last_name ? (user?.customer?.first_name ? " " : "") + user?.customer?.last_name : ""}`
      : `${user?.customer?.last_name || ""}${user?.customer?.first_name ? (user?.customer?.last_name ? " " : "") + user?.customer?.first_name : ""}`;

  return (
    <>
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        isMenuOpen={isMenuOpen}
        isBordered
        classNames={navClassNames}
        height="60px"
      >
        <div className="flex h-[60px] w-full">
          {/* Desktop */}
          {/* Left */}
          <NavbarContent
            className="!flex-grow-1 flex h-[60px] w-full gap-0 md:gap-3"
            justify="start"
            as={"div"}
          >
            <NavbarBrand className="lg:!flex-grow-0">
              <LinkBase
                href={"/"}
                className="hidden h-[48px] w-[140px] items-center justify-center dark:md:border dark:md:border-white dark:md:bg-white dark:md:bg-opacity-95 dark:md:backdrop-blur-md lg:flex"
              >
                <div className="relative h-[48px] w-[140px]">
                  <img
                    src={logoData?.siteLogo?.sourceUrl}
                    alt={logoData?.siteLogo?.title}
                    width={140}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>
              </LinkBase>
            </NavbarBrand>
            <NavbarContent
              className="flex w-full flex-none justify-between lg:hidden"
              justify="center"
              as={"div"}
            >
              <NavbarBrand>
                <LinkBase
                  href={"/"}
                  className="flex h-[36px] w-[100px] items-center justify-center dark:border dark:border-white dark:bg-white dark:bg-opacity-95 dark:backdrop-blur-md"
                >
                  <div className="relative h-[36px] w-[100px]">
                    <img
                      src={logoData?.siteLogo?.sourceUrl}
                      alt={logoData?.siteLogo?.title}
                      width={100}
                      height={36}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </LinkBase>
              </NavbarBrand>
            </NavbarContent>
          </NavbarContent>

          {/* Mobile menu */}
          {/* {!isAuthenticated && (
            <NavbarMenu id="menu-appbar">
              {mobileMenu ? (
                mobileMenu.menus.nodes[0].menuItems.nodes?.map(
                  (menu: ChildItem) => (
                    <NavbarMenuItem
                      key={menu.id}
                      isActive={pathname === `/${language}${menu.uri}`}
                    >
                      <LinkBase
                        onClick={handleCloseNavMenu}
                        href={`${menu.uri}`}
                      >
                        <p className="text-center leading-7 [&:not(:first-child)]:mt-6">
                          {menu.label}
                        </p>
                      </LinkBase>
                    </NavbarMenuItem>
                  )
                )
              ) : (
                <>
                  <NavbarMenuItem
                    isActive={pathname === `/en` || pathname === "/vi"}
                  >
                    <LinkBase onClick={handleCloseNavMenu} href="/">
                      <p className="text-center leading-7 [&:not(:first-child)]:mt-6">
                        {t("navigation.home")}
                      </p>
                    </LinkBase>
                  </NavbarMenuItem>
                  <NavbarMenuItem
                    isActive={pathname === `/${language}/sign-in`}
                  >
                    <LinkBase
                      onClick={handleCloseNavMenu}
                      href={`/${language}/sign-in`}
                    >
                      <p className="text-center leading-7 [&:not(:first-child)]:mt-6">
                        {t("navigation.signIn")}
                      </p>
                    </LinkBase>
                  </NavbarMenuItem>
                </>
              )}
            </NavbarMenu>
          )} */}

          <NavbarMenu
            id="menu-appbar"
            className="z-40 bg-white bg-white/70 px-10 backdrop-blur-xl"
          >
            {mobileMenu ? (
              <Accordion
                type="multiple"
                className="mb-40 flex w-full flex-col items-start gap-4"
              >
                {renderMenuItems(mobileMenu.menus.nodes[0].menuItems.nodes)}
                <NavbarMenuItem className="flex w-full lg:hidden">
                  <Button
                    onClick={handleCloseNavMenu}
                    asChild
                    className="h-[40px] rounded-lg px-3 py-[10px]"
                  >
                    <LinkBase href="tel:0924299898" className="w-full">
                      Hotline: 0924299898
                    </LinkBase>
                  </Button>
                </NavbarMenuItem>
                {!isAuthenticated && (
                  <NavbarMenuItem
                    isActive={pathname === `/${language}/sign-in`}
                    className="w-full"
                  >
                    <Button
                      onClick={handleCloseNavMenu}
                      asChild
                      className="h-[40px] rounded-lg border border-primary !bg-transparent px-3 py-[10px] !text-primary"
                    >
                      <LinkBase
                        href={`/${language}/sign-in`}
                        className="w-full"
                      >
                        <p className="text-sm font-semibold leading-7 [&:not(:first-child)]:mt-6">
                          {t("navigation.signIn")}
                        </p>
                      </LinkBase>
                    </Button>
                  </NavbarMenuItem>
                )}
              </Accordion>
            ) : (
              <>
                <NavbarMenuItem
                  isActive={pathname === `/en` || pathname === "/vi"}
                >
                  <LinkBase onClick={handleCloseNavMenu} href="/">
                    <p className="text-center leading-7 [&:not(:first-child)]:mt-6">
                      {t("navigation.home")}
                    </p>
                  </LinkBase>
                </NavbarMenuItem>
                <NavbarMenuItem isActive={pathname === `/${language}/sign-in`}>
                  <LinkBase
                    onClick={handleCloseNavMenu}
                    href={`/${language}/sign-in`}
                  >
                    <p className="text-center leading-7 [&:not(:first-child)]:mt-6">
                      {t("navigation.signIn")}
                    </p>
                  </LinkBase>
                </NavbarMenuItem>
              </>
            )}
          </NavbarMenu>

          {/* Shared Nav */}
          {/* Right */}
          <NavbarContent justify="end" className="flex">
            <NavbarItem>
              <NavbarContent className="ml-2 hidden gap-4 lg:flex">
                {mainMenu ? (
                  <>
                    {/* {bottomMenuItems} */}
                    {mainMenuItems}
                    <NavbarItem>
                      <Search highLightPosts={highLightPosts} />
                    </NavbarItem>
                  </>
                ) : (
                  <LinkBase onClick={handleCloseNavMenu} href="/">
                    <NavbarItem className="text-sm">
                      {t("navigation.home")}
                    </NavbarItem>
                  </LinkBase>
                )}
              </NavbarContent>
            </NavbarItem>

            <UserNotification />

            <NavbarItem className="hidden lg:flex">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    {contactHeaderIcons.length > 1 && (
                      <>
                        <Trigger
                          className="flex h-10 items-center justify-center bg-transparent px-0 font-normal hover:bg-transparent data-[active]:text-primary data-[state=open]:text-primary"
                          aria-label="Social media"
                        >
                          <IoShareSocialOutline className="h-5 w-5" />
                        </Trigger>
                        <NavigationMenuContent>
                          <ul className="flex w-36 items-center gap-3 p-2">
                            {contactHeaderIcons.map((icon, idx) => (
                              <NavbarItem key={idx}>
                                <LinkBase href={icon.link}>
                                  <Image
                                    src={icon.image}
                                    alt={icon.text}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                    unoptimized
                                  />
                                </LinkBase>
                              </NavbarItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    )}
                    {contactHeaderIcons.length === 1 && (
                      <LinkBase
                        href={contactHeaderIcons[0].link}
                        className="flex h-5 w-5"
                      >
                        <Image
                          src={contactHeaderIcons[0].image}
                          alt={contactHeaderIcons[0].text}
                          width={32}
                          height={32}
                          className="rounded-full"
                          unoptimized
                        />
                      </LinkBase>
                    )}
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </NavbarItem>

            {/* Change Language */}

            {/* {(<NavbarItem className="">
              <Suspense fallback={themeSwitchFallback}>
                <ThemeSwitchLanguage />
              </Suspense>
            </NavbarItem>)} */}
            {/* <NavbarItem className="hidden lg:flex">
              <Button
                onClick={handleCloseNavMenu}
                asChild
                className="rounded-lg"
              >
                <LinkBase href={"tel:0924299898"} className="flex gap-2">
                  <MdCall size={24} /> 0924299898
                </LinkBase>
              </Button>
            </NavbarItem> */}
            <NavbarItem className="lg:hidden">
              <div
                className="flex cursor-pointer flex-row items-center justify-center lg:hidden"
                onClick={toggleSearch}
              >
                <BiSearchAlt className="h-5 w-5 hover:text-primary group-hover:text-primary" />
              </div>
            </NavbarItem>

            <NavbarItem>
              <GoogleTranslate />
            </NavbarItem>

            {isAuthenticated ? (
              !user ? (
                <CircularProgress aria-label="Loading..." color="primary" />
              ) : (
                <>
                  <NavbarItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 overflow-hidden rounded-full border-none">
                        {/* <Avatar
                          className="flex aspect-square h-9 w-9 items-center justify-center rounded-s-full bg-default-200 text-base font-semibold transition-transform"
                          color="secondary"
                          name={
                            language === "en"
                              ? (user.customer.last_name ?? "")
                              : (user.customer.first_name ?? "")
                          }
                          size="sm"
                          src={user.customer.photo?.path}
                          ImgComponent={Image}
                          imgProps={imgProps}
                        /> */}

                        <Avatar className="flex h-full w-full flex-col items-center justify-center">
                          <AvatarImage
                            src={user?.customer?.photo?.path ?? ""}
                            className="h-full w-full bg-white object-cover"
                          />
                          <AvatarFallback className="bg-primary text-white">
                            {`${user.customer?.last_name?.[0] ?? ""}${
                              user.customer?.first_name?.[0] ?? ""
                            }`}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        aria-label="Profile Actions"
                        className="min-w-[200px] rounded-lg"
                      >
                        <DropdownMenuLabel>
                          <p className="!font-semibold">{fullName}</p>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                              {t("navigation.balance")}
                              {`${formatCurrency(user.customer?.balance || 0)}`}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={toggleTopUpDialog}
                            >
                              {t("top-up.button")}
                            </Button>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={toggleProfile}>
                          {t("navigation.profile")}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <LinkBase href="/user/bookings">
                            {t("navigation.bookings")}
                          </LinkBase>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <LinkBase href="/transactions">
                            {t("navigation.transactions")}
                          </LinkBase>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <LinkBase href="/user/cancel-ticket-request">
                            Theo dõi hủy vé
                          </LinkBase>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={logOut}
                          className="focus:bg-danger-100 focus:text-danger"
                        >
                          {t("navigation.logout")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </NavbarItem>
                </>
              )
            ) : (
              <>
                <NavbarItem className="hidden lg:flex">
                  <LinkBase
                    onClick={handleCloseNavMenu}
                    href="/sign-in"
                    aria-label="Login"
                  >
                    <MdOutlineAccountCircle className="text-3xl hover:text-primary" />
                    {/* <p className="text-center leading-7">
                        {t("navigation.signIn")}
                      </p> */}
                  </LinkBase>
                </NavbarItem>
              </>
            )}

            {/* {!isAuthenticated && (
              <NavbarMenuToggle
                className="h-12 w-12 rounded-lg bg-default-200 lg:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              />
            )} */}

            <NavbarItem className="lg:hidden">
              <NavbarMenuToggle
                className="h-9 w-9 rounded-lg bg-default-200 lg:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                icon={renderIcon} // Pass the memoized function here
              />
            </NavbarItem>
          </NavbarContent>
        </div>
        {/* {hasBottomMenu && (
          <div className="hidden h-[50px] w-full lg:flex">
            <NavbarContent className="flex gap-4">
              {bottomMenuItems}
            </NavbarContent>
          </div>
        )} */}
      </Navbar>
      {user && (
        <>
          <Profile
            isOpen={isProfileOpen}
            setIsOpen={setIsProfileOpen}
            user={user}
            language={language}
            setIsChangePasswordOpen={setIsChangePasswordOpen}
          />
          <ChangePassword
            user={user}
            isOpen={isChangePasswordOpen}
            setIsOpen={setIsChangePasswordOpen}
            language={language}
            setIsChangeProfileOpen={setIsProfileOpen}
          ></ChangePassword>
          <TopUpDialog open={isTopUpDialogOpen} onClose={toggleTopUpDialog} />
        </>
      )}
      <SupportContactForm />
      {displayVoucherSuggestion && (
        <ShowSuggestionVoucherDialog
          displayVoucherSuggestion={displayVoucherSuggestion}
        />
      )}
    </>
  );
};

const ListItem = ({
  title,
  children,
  className,
  href,
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
  href?: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <LinkBase
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-primary focus:bg-accent focus:text-accent-foreground",
            className
          )}
          href={href ?? ""}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </LinkBase>
      </NavigationMenuLink>
    </li>
  );
};

const ListMenuItem = ({ component }: { component: ChildItem }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <div
          // href={component.path}
          className={cn(
            "block select-none space-y-1 rounded-lg p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-primary focus:bg-accent focus:text-accent-foreground"
          )}
        >
          <div className="text-base font-semibold">{component.label}</div>
        </div>
      </NavigationMenuLink>
      <ul>
        {component.childItems?.nodes.map((child, idx) => (
          <ListItem
            key={idx}
            title={child.label}
            href={child.uri}
            className="!px-2 !font-normal"
          />
        ))}
      </ul>
    </li>
  );
};

export default memo(ResponsiveAppBar);
