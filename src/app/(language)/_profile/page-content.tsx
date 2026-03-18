"use client";

import { useTranslation } from "react-i18next";
import useAuth from "@/services/auth/use-auth";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import useLanguage from "@/services/i18n/use-language";
import { FiUser } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LinkBase from "@/components/link-base";

function Profile() {
  const { user } = useAuth();
  const language = useLanguage();
  const { t } = useTranslation("profile");

  const fullName =
    language === "en"
      ? `${user?.customer.first_name} ${user?.customer.last_name}`
      : `${user?.customer.last_name} ${user?.customer.first_name}`;

  const avatarAlt =
    language === "en"
      ? (user?.customer.last_name ?? "")
      : (user?.customer.first_name ?? "");

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-40 w-40">
              <AvatarImage src={user?.customer.photo?.path} alt={avatarAlt} />
              <AvatarFallback>
                <FiUser className="h-20 w-20" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-4 sm:items-start">
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="text-xl text-muted-foreground">{user?.email}</p>
              <Button asChild>
                <LinkBase href="/profile/edit">
                  {t("profile:actions.edit")}
                </LinkBase>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withPageRequiredAuth(Profile);
