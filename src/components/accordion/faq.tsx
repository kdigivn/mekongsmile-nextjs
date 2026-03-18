import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { Faq as FaqType } from "@/services/infrastructure/wordpress/types/sideBar";
import HeadingBase from "../heading/heading-base";
import { getFAQSchema } from "@/lib/utils";
import { getServerTranslation } from "@/services/i18n";
import { getFaqSubsection } from "@/services/infrastructure/wordpress/queries/getBlockCustom";

async function Faq() {
  const { t } = await getServerTranslation("vi", "home/faq-section");
  const faq: FaqType = await getFaqSubsection();
  const faqSchema = getFAQSchema(faq);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="flex w-full flex-col items-center gap-6 pt-4">
        <HeadingBase>{t("title")}</HeadingBase>
        <Accordion
          type="multiple"
          className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-6"
        >
          {faq.map((item, index) => (
            <AccordionItem
              key={index}
              value={`${index}`}
              className="h-fit w-full rounded-lg border-2 border-transparent bg-white px-4 focus:bg-black"
            >
              <AccordionTrigger className="w-full gap-2 text-left text-base font-semibold transition-all hover:text-primary hover:no-underline data-[state=open]:text-primary">
                {item.faqKey}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  dangerouslySetInnerHTML={{
                    __html: item.faqValue ?? "",
                  }}
                  className="post-detail"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}

export default Faq;
