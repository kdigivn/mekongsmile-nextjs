/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @arthurgeron/react-usememo/require-usememo */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCancelTicketRequestRecallMutation } from "@/services/apis/cancel-ticket-request/cancel-ticket-request.service";
import {
  CancelTicketRequest,
  RecallCancelTicketRequestPayload,
} from "@/services/apis/cancel-ticket-request/types/cancel-ticket-request";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import React, { memo, useMemo, useCallback, useEffect } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormState,
} from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { ValidationErrors } from "@/services/apis/common/types/validation-errors";
import { useMobileBottomNavActions } from "@/components/footer/footer-mobile-contact-buttons/use-mobile-bottom-nav-actions";

interface Props {
  open: boolean;
  onClose: () => void;
  cancelTicketRequest: CancelTicketRequest;
}

const RecallCancelTicketRequestDialog = ({
  open,
  onClose,
  cancelTicketRequest,
}: Props) => {
  const router = useRouter();
  const { recallCancelTicketRequestAsync, recallCancelTicketRequestPending } =
    useCancelTicketRequestRecallMutation(cancelTicketRequest.id);
  const { t } = useTranslation("user/cancel-ticket-request");

  const { hideNav, showNav } = useMobileBottomNavActions();

  useEffect(() => {
    if (open) {
      hideNav();
    } else {
      showNav();
    }
  }, [hideNav, open, showNav]);

  /**
   * RECALL CANCEL TICKET FORM PROCESSING
   */
  const schema = yup.object().shape({
    recall_message: yup
      .string()
      .required(
        t(
          "dialog.recall-cancel-ticket-request-dialog.form.errors.recall_message"
        )
      ),
  });
  type FormTypes = yup.InferType<typeof schema>;

  const defaultValues: FormTypes = {
    recall_message: "",
  };

  const methods = useForm<FormTypes>(
    useMemo(
      () => ({
        resolver: yupResolver(schema),
        defaultValues,
      }),
      [defaultValues, schema]
    )
  );

  const { handleSubmit, control } = methods;
  const { errors } = useFormState(methods);

  const onSubmit = useCallback(
    async (data: FormTypes) => {
      const payload: RecallCancelTicketRequestPayload = {
        recall_message: data.recall_message,
      };

      try {
        const response = (await recallCancelTicketRequestAsync(payload)) as any;

        if (response?.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
          throw { ...response.data };
        }

        toast.success(
          t("dialog.recall-cancel-ticket-request-dialog.messages.success")
        );
        onClose();
        router.refresh();
      } catch (error) {
        const error_res = error as ValidationErrors & Error;
        toast.error(t(`errors.${error_res.data.errors?.errorCode}`));
      }
    },
    [onClose, recallCancelTicketRequestAsync, router]
  );

  return (
    <Dialog open={open} onOpenChange={onClose} modal>
      <DialogContent className="max-w-lg">
        <DialogTitle>
          <h5>
            {t("dialog.recall-cancel-ticket-request-dialog.title")}
            {cancelTicketRequest.id}
          </h5>
        </DialogTitle>

        <div className="flex flex-col gap-2">
          <FormProvider {...methods}>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                name="recall_message"
                control={control}
                render={({ field }) => (
                  <>
                    <Textarea
                      {...field}
                      placeholder={t(
                        "dialog.recall-cancel-ticket-request-dialog.form.placeholder"
                      )}
                    />
                    {errors.recall_message && (
                      <span className="text-sm text-red-500">
                        {errors.recall_message.message}
                      </span>
                    )}
                  </>
                )}
              />
              <DialogFooter>
                <Button variant={"outline"} onClick={onClose}>
                  {t(
                    "dialog.recall-cancel-ticket-request-dialog.buttons.cancel"
                  )}
                </Button>
                <Button
                  variant={"default"}
                  type="submit"
                  disabled={recallCancelTicketRequestPending}
                >
                  {recallCancelTicketRequestPending
                    ? t(
                        "dialog.recall-cancel-ticket-request-dialog.buttons.submitting"
                      )
                    : t(
                        "dialog.recall-cancel-ticket-request-dialog.buttons.submit"
                      )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(RecallCancelTicketRequestDialog);
