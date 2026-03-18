"use client";

import { memo, useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import LinkBase from "./link-base";
import { NavbarItem } from "@heroui/react";
import { useTranslation } from "@/services/i18n/client";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { Button } from "./ui/button";
import { compareAsc } from "date-fns";
import { LuBell } from "react-icons/lu";
import { useGetNotificationsQuery } from "@/services/apis/cms/notification.service";
import { useBoolean } from "@/hooks/use-boolean";

/**
 * A notification component that displays post list have thong-bao slug
 * @returns {JSX.Element} The notification component
 */
const UserNotification = () => {
  const { t } = useTranslation("common");
  const [checkPing, setCheckPing] = useState(false);
  const isOpen = useBoolean(false);

  const { notifications } = useGetNotificationsQuery();

  const handleOnClick = useCallback(() => {
    isOpen.onToggle();
    setCheckPing(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "newestNotifiedPostId",
        JSON.stringify({
          id: notifications[0]?.id,
          date: notifications[0]?.modified,
        })
      );
    }
  }, [notifications, isOpen]); // Add dependencies if needed

  // useEffect(() => {
  //   getNotifiedPosts();
  // }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newestNotifiedPostId =
        localStorage.getItem(`newestNotifiedPostId`) || "{}";
      const newestNotifiedPostIdData = JSON.parse(newestNotifiedPostId);
      if (
        notifications.length > 0 &&
        notifications[0]?.id !== newestNotifiedPostIdData.id &&
        (compareAsc(
          new Date(newestNotifiedPostIdData.date),
          new Date(notifications[0]?.modified)
        ) === -1 ||
          compareAsc(
            new Date(newestNotifiedPostIdData.date),
            new Date(notifications[0]?.modified)
          ) !== 1)
      ) {
        // Set the checkPing state to true if the conditions are met
        setCheckPing(true);
      } else {
        // Otherwise, set checkPing to false
        setCheckPing(false);
      }
    }
  }, [notifications]);

  return (
    <NavbarItem>
      <DropdownMenu open={isOpen.value} onOpenChange={handleOnClick}>
        <DropdownMenuTrigger
          className="relative flex h-10 items-center hover:bg-transparent hover:text-primary"
          aria-label="Notification"
        >
          <LuBell className="h-5 w-5" />
          {checkPing && (
            <span className="absolute left-[14px] top-[8px] flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger"></span>
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          className="mr-4 w-80" // Increased width and added right margin
          sideOffset={5} // Added offset to move it slightly away from the trigger
        >
          <DropdownMenuLabel className="text-lg">
            {t("notification.title")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length <= 0 ? (
            <div className="px-2 py-1.5 text-sm">{t("notification.empty")}</div>
          ) : (
            notifications.slice(0, 3).map((post) => (
              <DropdownMenuItem
                asChild
                className="cursor-pointer"
                key={post.id}
              >
                <LinkBase href={`/${post.slug}`} className="flex gap-2 p-2">
                  <Image
                    src={
                      post.featuredImage?.node.sourceUrl ??
                      "/static-img/placeholder-image-700x394.png"
                    }
                    alt={post.title}
                    height={56}
                    width={56}
                    loading="lazy"
                    unoptimized
                    className="aspect-[16/9] h-14 !rounded-full object-cover"
                  />
                  <div className="flex flex-col justify-start gap-2">
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-primary">
                      {formatDistanceToNow(new Date(post.modified), {
                        locale: vi,
                      })}
                    </p>
                  </div>
                </LinkBase>
              </DropdownMenuItem>
            ))
          )}
          {notifications.length > 3 && (
            <DropdownMenuItem asChild className="focus:bg-transparent">
              <LinkBase href="/thong-bao" className="w-full">
                <Button className="w-full">{t("notification.button")}</Button>
              </LinkBase>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </NavbarItem>
  );
};

export default memo(UserNotification);
