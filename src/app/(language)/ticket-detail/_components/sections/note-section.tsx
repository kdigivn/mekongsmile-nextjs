import { useTranslation } from "@/services/i18n/client";
import { Accordion, AccordionItem } from "@heroui/react";
import { memo, useMemo } from "react";

type Props = {
  operatorNote?: string;
};

function NoteSection({ operatorNote }: Props) {
  const { t } = useTranslation("ticket-detail");
  // const defaultValue = useMemo(() => ["note"], []);

  const classNames = useMemo(
    () => ({
      indicator: "font-semibold text-lg text-black",
      title:
        "w-fit flex flex-row-reverse justify-end gap-2 font-bold text-danger-500 hover:no-underline text-md",
    }),
    []
  );
  return (
    <Accordion className="text-md w-full">
      <AccordionItem
        value="note"
        classNames={classNames}
        title={t("note.title")}
        key={"note"}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: operatorNote ?? "",
          }}
          className="note-detail ml-4 list-disc text-sm text-info"
        />

        {/* {operatorCode === "phuquyexpress" ? (
          <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-info marker:mr-1">
            <li>{t("note.phuquy.content-1")}</li>
            <li>{t("note.phuquy.content-2")}</li>
            <li>{t("note.phuquy.content-3")}</li>
            <li>{t("note.phuquy.content-4")}</li>
            <li>{t("note.phuquy.content-5")}</li>
            <li>{t("note.phuquy.content-6")}</li>
            <li>{t("note.phuquy.content-7")}</li>
            <li>{t("note.phuquy.content-8")}</li>
            <li>{t("note.phuquy.content-9")}</li>
            <li>{t("note.phuquy.content-10")}</li>
          </ul>
        ) : (
          <ul className="flex list-inside list-disc flex-col gap-2 text-sm text-info marker:mr-1">
            <li>{t("note.content-1")}</li>
            <li>{t("note.content-2")}</li>
            <li>{t("note.content-3")}</li>
            <li>{t("note.content-4")}</li>
            <li>{t("note.content-5")}</li>
            <li>{t("note.content-6")}</li>
            <li>{t("note.content-7")}</li>
          </ul>
        )} */}
      </AccordionItem>
    </Accordion>
  );
}

export default memo(NoteSection);
