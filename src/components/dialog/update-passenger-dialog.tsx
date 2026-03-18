"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdatePassengerInfoMutation } from "@/services/apis/orders/orders.service";
import { useTranslation } from "@/services/i18n/client";
import { toast } from "sonner";
import { memo, useCallback, useEffect, useMemo } from "react";
import {
  PassengerConfig,
  UpdatePassengerInfoProps,
} from "@/services/apis/passengers/types/passenger";
import * as yup from "yup";
import { Control, FormProvider, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormTextInput from "../form-elements/text-input/form-text-input";
import { OperatorOrderErrors } from "@/services/apis/common/types/common-errors";
import { removeAccents } from "@/lib/utils";

export type UpdatePassengerDialogProps = {
  requestOrderInfo: UpdatePassengerInfoProps | null;
  isOpen: boolean;
  onClose: () => void;
};

type UpdatePassengerFormData = {
  name?: string | null;
  socialId?: string | null;
};

const useValidationUpdatePassengerSchema = (
  passengerConfig?: PassengerConfig
) => {
  const { t } = useTranslation("booking");

  return yup.object().shape({
    name: passengerConfig?.full_name.enable
      ? yup
          .string()
          .trim()
          .required(t("update-passenger-dialog.yup-error.name"))
      : yup.string().nullable(),
    socialId: passengerConfig?.social_id.enable
      ? yup
          .string()
          .trim()
          .required(t("update-passenger-dialog.yup-error.social-id"))
          .min(
            passengerConfig?.social_id.validation?.min_length || 0,
            t("update-passenger-dialog.yup-error.social-id-min", {
              min: passengerConfig?.social_id.validation?.min_length,
            })
          )
          .max(
            passengerConfig?.social_id.validation?.max_length || Infinity,
            t("update-passenger-dialog.yup-error.social-id-max", {
              max: passengerConfig?.social_id.validation?.max_length,
            })
          )
      : yup.string().nullable(),
  });
};

interface NameTransformerProps {
  control: Control<UpdatePassengerFormData>;
  setValue: (name: keyof UpdatePassengerFormData, value: string) => void;
}

const NameTransformer = ({ control, setValue }: NameTransformerProps) => {
  const nameValue = useWatch(
    useMemo(() => ({ control, name: "name" }), [control])
  ) as string;

  useEffect(() => {
    if (nameValue) {
      const transformedName = removeAccents(nameValue).toUpperCase();
      if (transformedName !== nameValue) {
        setValue("name", transformedName);
      }
    }
  }, [nameValue, setValue]);

  return null;
};

const UpdatePassengerDialog = ({
  requestOrderInfo,
  isOpen,
  onClose,
}: UpdatePassengerDialogProps) => {
  const { t } = useTranslation("booking");
  const validationSchema = useValidationUpdatePassengerSchema(
    requestOrderInfo?.passengerConfig
  );
  const { updatePassengerInfoPending, updatePassengerInfoAsync } =
    useUpdatePassengerInfoMutation(
      requestOrderInfo?.orderId as string,
      requestOrderInfo?.bookingId as string
    );

  const formMethods = useForm<UpdatePassengerFormData>(
    useMemo(
      () => ({
        resolver: yupResolver(validationSchema),
        defaultValues: {
          name: requestOrderInfo?.passengerName as string | "",
          socialId: requestOrderInfo?.passengerSocialId as string | "",
        },
      }),
      [validationSchema, requestOrderInfo]
    )
  );

  useEffect(() => {
    formMethods.setValue("name", requestOrderInfo?.passengerName || "");
    formMethods.setValue("socialId", requestOrderInfo?.passengerSocialId || "");
  }, [formMethods, requestOrderInfo]);

  const { handleSubmit, reset, setValue } = formMethods;

  const onSubmit = async (formData: UpdatePassengerFormData) => {
    try {
      const data = await updatePassengerInfoAsync({
        seat_name: requestOrderInfo?.seatName as string,
        name: formData.name as string | "",
        social_id: formData.socialId as string | "",
      });
      if (data) {
        toast.success(t("update-passenger-dialog.notification.success"));
        onClose();
      } else {
        toast.error(t("update-passenger-dialog.notification.error"));
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorObj = JSON.parse(error.message);
        if (
          errorObj.errorCode ===
          OperatorOrderErrors.ModifyTicketFailedDueToTicketNotFound
        ) {
          toast.error(
            t("update-passenger-dialog.notification.error-ticket-not-found")
          );
        } else {
          toast.error(t("update-passenger-dialog.notification.error"));
        }
      } else {
        toast.error(t("update-passenger-dialog.notification.error"));
      }
    }
  };

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const inputClassNames = useMemo(
    () => ({
      input: "h-full",
      label:
        "!group-data-[filled-within=true]:-translate-y-[calc(80% + theme(fontSize.small)/2 - 6px - theme(borderWidth.medium))] group-data-[filled-within=true]:top-[-.1rem] bg-white group-data-[filled-within=true]:text-black group-data-[filled-within=true]:font-semibold !px-1",
    }),
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("update-passenger-dialog.title", {
              seatName: requestOrderInfo?.seatName,
            })}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
          >
            <NameTransformer
              control={formMethods.control}
              setValue={setValue}
            />
            <FormTextInput
              name="name"
              label={t("update-passenger-dialog.field.name")}
              isRequired
              classNames={inputClassNames}
              type="text"
            />
            <FormTextInput
              name="socialId"
              label={t("update-passenger-dialog.field.social-id")}
              isRequired
              classNames={inputClassNames}
              type="text"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t("update-passenger-dialog.button.cancel")}
              </Button>
              <Button type="submit" disabled={updatePassengerInfoPending}>
                {t("update-passenger-dialog.button.update")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default memo(UpdatePassengerDialog);
