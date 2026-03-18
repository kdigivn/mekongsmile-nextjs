import { useCallback } from "react";
import { FerryTicketApiEndpoints } from "../endpoints";

export function useCreateContact() {
  return useCallback((data: ContactInfo) => {
    const requestUrl = FerryTicketApiEndpoints["third-party"].nucuoimekong.lead;
    return fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }, []);
}

export type ContactInfo = {
  fullName: string;
  phone: string;
  source_title: string;
  source_url: string;
};
