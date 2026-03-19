"use client";

import { Phone, MessageCircle } from "lucide-react";

const CONTACTS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/84987654321",
    icon: MessageCircle,
    bg: "bg-green-500 hover:bg-green-600",
  },
  {
    label: "Messenger",
    href: "https://m.me/mekongsmile",
    icon: MessageCircle,
    bg: "bg-blue-500 hover:bg-blue-600",
  },
  {
    label: "Call us",
    href: "tel:+84987654321",
    icon: Phone,
    bg: "bg-brand-gold hover:bg-brand-gold-light",
  },
];

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 z-[45] flex flex-col gap-3 max-lg:bottom-24">
      {CONTACTS.map((contact) => (
        <a
          key={contact.label}
          href={contact.href}
          target={contact.href.startsWith("http") ? "_blank" : undefined}
          rel={
            contact.href.startsWith("http")
              ? "noopener noreferrer"
              : undefined
          }
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 ${contact.bg}`}
          aria-label={contact.label}
        >
          <contact.icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
