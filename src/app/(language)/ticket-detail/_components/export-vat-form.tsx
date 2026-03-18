import PassengerFormTextInput from "@/components/form-elements/text-input/passenger-form-text-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  RequestGetTaxRecordById,
  useGetTaxRecordQuery,
} from "@/services/apis/tax-record/tax-record.service";
import {
  TaxRecordFromData,
  VoyageFormData,
} from "@/services/form/types/form-types";
import { useTranslation } from "@/services/i18n/client";
import { useMemo, useCallback, useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiCloudDownload } from "react-icons/bi";

type Props = {
  method: UseFormReturn<VoyageFormData>;
  taxData?: TaxRecordFromData;
};

function ExportVatForm({ method, taxData }: Props) {
  const { t: ticketDetailTranslation } = useTranslation("ticket-detail");
  const [requestTaxRecord, setRequestTaxRecord] =
    useState<RequestGetTaxRecordById>({});
  const [isEnable, setIsEnable] = useState(false);
  const { taxRecord, taxRecordError, taxRecordLoading } = useGetTaxRecordQuery(
    requestTaxRecord,
    undefined,
    isEnable
  );
  const [taxFormData, setTaxFormData] = useState<TaxRecordFromData>();

  const inputClassNames = useMemo(
    () => ({
      base: "col-span-6 md:col-span-3 flex flex-col gap-1.5 flex flex-col gap-1.5",
      input:
        "!mt-0 min-h-7 rounded-md border-1 border-default-400 p-1 px-3 py-2 text-default-700 data-[hover=true]:border-black md:text-sm",
      label: "font-medium md:text-sm text-xs",
    }),
    []
  );

  useEffect(() => {
    if (taxData) {
      method.reset({
        ...method.getValues(),
        vat: {
          email: taxData.email,
          taxNumber: taxData.taxNumber,
          name: taxData.name,
          address: taxData.address,
        },
      });
      setTaxFormData({
        email: taxData.email,
        taxNumber: taxData.taxNumber,
        name: taxData.name,
        address: taxData.address,
      });
    } else {
      method.reset({
        ...method.getValues(),
        vat: {
          email: "",
          taxNumber: "",
          name: "",
          address: "",
        },
      });
      setTaxFormData({
        email: "",
        taxNumber: "",
        name: "",
        address: "",
      });
    }
  }, [method, taxData]);

  const inputFull = useMemo(
    () => ({
      ...inputClassNames,
      base: "w-full",
    }),
    [inputClassNames]
  );

  const handleClick = useCallback(() => {
    if (method.getValues("vat.taxNumber") !== "") {
      setRequestTaxRecord({
        taxId: method.getValues("vat.taxNumber"),
      });
      setIsEnable(true);
    } else {
      setIsEnable(false);
      method.setError("vat.taxNumber", {
        type: "custom",
        message: "Vui lòng nhập mã số thuế",
      });
    }
  }, [method]);

  useEffect(() => {
    if (taxRecord) {
      method.reset({
        ...method.getValues(),
        vat: {
          email: method.getValues("vat.email"),
          taxNumber: taxRecord.taxCode,
          name: taxRecord.companyName,
          address: taxRecord.address,
        },
      });
      setTaxFormData((prev) => ({
        ...prev,
        taxNumber: "",
        name: " ",
        address: " ",
      }));
      setTimeout(() => {
        setTaxFormData((prev) => ({
          ...prev,
          taxNumber: taxRecord.taxCode,
          name: taxRecord.companyName,
          address: taxRecord.address,
        }));
      }, 10);

      method.clearErrors();
    }
    if (taxRecordError) {
      method.setError("vat.taxNumber", {
        type: "custom",
        message: "Không tìm thấy thông tin",
      });
    }
  }, [method, requestTaxRecord, taxRecord, taxRecordError]);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="flex w-full flex-row justify-between p-0 hover:no-underline">
          <p className="text-base font-bold">
            {ticketDetailTranslation(
              "passenger-details.passenger-details-input.exportVatForm.title"
            )}
          </p>
        </AccordionTrigger>
        <AccordionContent className="w-full px-[1px] py-4">
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-7">
            <div className="grid grid-cols-6 flex-row gap-2">
              <PassengerFormTextInput
                name="vat.email"
                label={ticketDetailTranslation(
                  "passenger-details.passenger-details-input.exportVatForm.input.email.label"
                )}
                placeholder={ticketDetailTranslation(
                  "passenger-details.passenger-details-input.exportVatForm.input.email.placeholder"
                )}
                isRequired
                classNames={inputClassNames}
                defaultValue={taxFormData?.email}
              />
              <div className="col-span-6 flex gap-2 md:col-span-3">
                <PassengerFormTextInput
                  name="vat.taxNumber"
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.exportVatForm.input.taxNumber.label"
                  )}
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.exportVatForm.input.taxNumber.placeholder"
                  )}
                  isRequired
                  classNames={inputFull}
                  defaultValue={taxFormData?.taxNumber}
                />
                <Button
                  className="flex h-fit w-fit gap-1 rounded-md bg-primary-100 p-2 text-black hover:bg-primary-200"
                  onClick={handleClick}
                  type="button"
                  disabled={taxRecordLoading}
                >
                  {taxRecordLoading ? (
                    <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin font-semibold" />
                  ) : (
                    <BiCloudDownload className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="col-span-6">
                <PassengerFormTextInput
                  name="vat.name"
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.exportVatForm.input.companyName.label"
                  )}
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.exportVatForm.input.companyName.placeholder"
                  )}
                  isRequired
                  classNames={inputFull}
                  defaultValue={taxFormData?.name}
                />
              </div>
              <div className="col-span-6">
                <PassengerFormTextInput
                  name="vat.address"
                  label={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.exportVatForm.input.address.label"
                  )}
                  placeholder={ticketDetailTranslation(
                    "passenger-details.passenger-details-input.exportVatForm.input.address.placeholder"
                  )}
                  isRequired
                  classNames={inputFull}
                  defaultValue={taxFormData?.address}
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ExportVatForm;
