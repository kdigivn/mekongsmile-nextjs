"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ShortTourFaq } from "@/graphql/types";

type Props = {
  faqs: ShortTourFaq[];
};

export default function TourFaqSection({ faqs }: Props) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="font-heading mb-4 text-xl font-semibold">Frequently Asked Questions</h2>
      <Accordion type="multiple">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`faq-${idx}`}>
            <AccordionTrigger isHeader className="text-left font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
