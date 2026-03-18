"use client";

import { memo, useMemo, useEffect } from "react";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "@/services/i18n/client";
import { useAuthPatchMeService } from "@/services/apis/auth/auth.service";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import useLeavePage from "@/services/leave-page/use-leave-page";
import { toast } from "sonner";
import { FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { FileEntity } from "@/services/apis/files/types/file-entity";
import LinkBase from "@/components/link-base";

type EditProfileBasicInfoFormData = {
  first_name: string;
  last_name: string;
  photo?: FileEntity;
};

const useValidationBasicInfoSchema = () => {
  const { t } = useTranslation("profile");

  return yup.object().shape({
    first_name: yup
      .string()
      .required(t("profile:inputs.firstName.validation.required")),
    last_name: yup
      .string()
      .required(t("profile:inputs.lastName.validation.required")),
  });
};

function BasicInfoFormActions() {
  const { t } = useTranslation("profile");
  const { isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <div className="flex space-x-2">
      <Button type="submit">{t("profile:actions.submit")}</Button>
      <Button variant="outline" asChild>
        <LinkBase href="/profile">{t("profile:actions.cancel")}</LinkBase>
      </Button>
    </div>
  );
}

function FormBasicInfo() {
  const { setUser } = useAuthActions();
  const { user } = useAuth();
  const fetchAuthPatchMe = useAuthPatchMeService();
  const { t } = useTranslation("profile");
  const validationSchema = useValidationBasicInfoSchema();

  const methods = useForm<EditProfileBasicInfoFormData>(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          first_name: "",
          last_name: "",
          photo: undefined,
        },
      }),
      [validationSchema]
    )
  );

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = async (formData: EditProfileBasicInfoFormData) => {
    const { data, status } = await fetchAuthPatchMe(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      Object.keys(data.errors).forEach((key) => {
        setError(key as keyof EditProfileBasicInfoFormData, {
          type: "manual",
          message: t(
            `profile:inputs.${key}.validation.server.${data.errors[key]}`
          ),
        });
      });
      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      setUser(data);
      toast.success(t("profile:alerts.profile.success"));
    }
  };

  useEffect(() => {
    reset({
      first_name: user?.customer.first_name ?? "",
      last_name: user?.customer.last_name ?? "",
      photo: user?.customer.photo ?? undefined,
    });
  }, [user, reset]);

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("profile:title1")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.customer.photo?.path} />
                <AvatarFallback>
                  <FiUser className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            <Input
              {...methods.register("first_name")}
              placeholder={t("profile:inputs.firstName.label")}
            />
            <Input
              {...methods.register("last_name")}
              placeholder={t("profile:inputs.lastName.label")}
            />
            <BasicInfoFormActions />
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

function EditProfile() {
  return (
    <div className="container mx-auto p-4">
      <FormBasicInfo />
      {/* FormChangePasswordWrapper would go here */}
    </div>
  );
}

export default withPageRequiredAuth(memo(EditProfile));
