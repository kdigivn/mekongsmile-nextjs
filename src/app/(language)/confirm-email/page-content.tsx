"use client";

import { memo, useEffect } from "react";
import { useAuthConfirmEmailService } from "@/services/apis/auth/auth.service";
import { useRouter } from "next/navigation";
import HTTP_CODES_ENUM from "@/services/apis/common/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { toast } from "sonner";
import { BiLoaderAlt } from "react-icons/bi";

function ConfirmEmail() {
  const fetchConfirmEmail = useAuthConfirmEmailService();
  const router = useRouter();
  const { t } = useTranslation("confirm-email");

  useEffect(() => {
    const confirm = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = params.get("hash");

      if (hash) {
        const { status } = await fetchConfirmEmail({
          hash,
        });

        if (status === HTTP_CODES_ENUM.OK) {
          toast.success(t("confirm-email:emailConfirmed"));
          router.replace("/");
        } else {
          toast.error(t("confirm-email:emailConfirmFailed"));
          router.replace("/");
        }
      }
    };

    confirm();
  }, [fetchConfirmEmail, router, t]);

  return (
    <div className="container max-w-sm">
      <div className="flex items-center justify-center p-8">
        <BiLoaderAlt className="h-8 w-8 animate-spin" />
      </div>
    </div>
  );
}

export default memo(ConfirmEmail);
