/* eslint-disable @next/next/no-img-element */
"use client";
import { useTranslation } from "@/services/i18n/client";
import useLanguage from "@/services/i18n/use-language";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { usePathname } from "next/navigation";
import React, { memo, useCallback, useMemo, useState } from "react";
import LinkBase from "./link-base";
import { Button } from "./ui/button";
import type { Menu, MenuItem } from "@/graphql/types";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { IoIosMenu, IoMdClose } from "react-icons/io";
import dynamic from "next/dynamic";

type Props = {
  primaryMenu: Menu;
  siteTitle: string;
};

const GoogleTranslate = dynamic(
  () => import("./google-translate/google-translate"),
  { ssr: false }
);

const ResponsiveAppBar = ({ primaryMenu, siteTitle }: Props) => {
  const { t } = useTranslation("common");
  // TODO: re-add auth when custom backend is ready
  const isAuthenticated = false;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const language = useLanguage();

  const handleCloseNavMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

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

  // TODO: re-add profile/password modals when auth is rebuilt

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
  const renderMenuItems = (menuItems: MenuItem[], level = 0) => {
    if (menuItems && menuItems.length > 0) {
      return menuItems.map((menu: MenuItem) => {
        // Safely check if there are child items
        const hasChildren =
          menu?.childItems?.nodes && menu?.childItems?.nodes?.length > 0;

        if (hasChildren) {
          // Menu item with children: render as Accordion
          return (
            <AccordionItem
              key={menu.databaseId}
              value={`item-${menu.databaseId}`}
              className={cn(
                "w-full",
                level === 0 ? "border-b-1 border-default-400" : "border-none"
              )}
            >
              <div className="flex flex-row items-center gap-2 border-b-1 border-default-400">
                <NavbarMenuItem
                  key={menu.databaseId}
                  isActive={pathname === `/${language}${menu.path}`}
                  className={cn(
                    "w-full",
                    level === 0
                      ? "py-2"
                      : `ml-${level * 2} py-2 text-black hover:bg-primary-100`
                  )}
                >
                  <LinkBase onClick={handleCloseNavMenu} href={`${menu.path}`}>
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
              key={menu.databaseId}
              isActive={pathname === `/${language}${menu.path}`}
              className={cn(
                "w-full",
                level === 0
                  ? "border-b-1 border-default-400 py-2"
                  : `ml-${level * 2} py-2 text-black hover:bg-primary-100`
              )}
            >
              <LinkBase onClick={handleCloseNavMenu} href={`${menu.path}`}>
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
  if (primaryMenu) {
    mainMenuItems =
      primaryMenu.menuItems.nodes.map((menuItem: MenuItem, idx) => {
        const childItems = menuItem?.childItems?.nodes ?? [];
        if (childItems.length > 0) {
          return (
            <NavbarItem key={idx}>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent px-0 font-normal hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent data-[active]:text-primary data-[state=open]:text-primary">
                      {menuItem.path ? (
                        <LinkBase
                          href={menuItem.path}
                          className="text-sm font-medium hover:text-primary"
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
                              key={String(component.databaseId)}
                              title={component.label}
                              href={component.path}
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
                        href={menuItem.path}
                        className="text-sm font-medium hover:text-primary"
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
      }) ?? [];
  }

  // const themeSwitchFallback = useMemo(
  //   () => <Skeleton className="h-10 rounded-lg bg-neutral-200" />,
  //   []
  // );

  return (
    <>
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        isMenuOpen={isMenuOpen}
        isBordered
        classNames={navClassNames}
        height="60px"
        className="bg-white/95 backdrop-blur-md"
      >
        <div className="flex h-[60px] w-full">
          {/* Desktop */}
          {/* Left */}
          <NavbarContent
            className="!flex-grow-1 flex h-[60px] w-full gap-0 md:gap-3"
            justify="start"
            as={"div"}
          >
            <NavbarBrand className="lg:!flex-grow-0 lg:!basis-auto">
              <LinkBase
                href={"/"}
                className="flex h-[48px] items-center justify-center"
              >
                <img
                  src="/static-img/mekongsmile-logo-full.png"
                  alt={siteTitle}
                  width={180}
                  height={40}
                  className="h-8 w-auto lg:h-10"
                />
              </LinkBase>
            </NavbarBrand>
          </NavbarContent>

          {/* Mobile menu */}
          {/* {!isAuthenticated && (
            <NavbarMenu id="menu-appbar">
              {mobileMenu ? (
                mobileMenu.menus.nodes[0].menuItems.nodes?.map(
                  (menu: ChildItem) => (
                    <NavbarMenuItem
                      key={menu.databaseId}
                      isActive={pathname === `/${language}${menu.path}`}
                    >
                      <LinkBase
                        onClick={handleCloseNavMenu}
                        href={`${menu.path}`}
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
            {primaryMenu ? (
              <Accordion
                type="multiple"
                className="mb-40 flex w-full flex-col items-start gap-4"
              >
                {renderMenuItems(primaryMenu.menuItems.nodes)}
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
                {primaryMenu ? (
                  <>{mainMenuItems}</>
                ) : (
                  <LinkBase onClick={handleCloseNavMenu} href="/">
                    <NavbarItem className="text-sm">
                      {t("navigation.home")}
                    </NavbarItem>
                  </LinkBase>
                )}
              </NavbarContent>
            </NavbarItem>

            <NavbarItem>
              <GoogleTranslate />
            </NavbarItem>

            {/* TODO: re-add user auth dropdown when auth system is re-implemented */}

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
      {/* Profile and ChangePassword dialogs removed — TODO: re-add when auth is re-implemented */}
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

const ListMenuItem = ({ component }: { component: MenuItem }) => {
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
            href={child.path}
            className="!px-2 !font-normal"
          />
        ))}
      </ul>
    </li>
  );
};

export default memo(ResponsiveAppBar);
