import { VoyageItem } from "@/services/apis/voyages/types/voyage";

export type Event = {
  start?: Date;
  end?: Date;
  voyageItem: VoyageItem;
  colorEvento: string;
  color: string;
};
