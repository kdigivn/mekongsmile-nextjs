import { InfinityPaginationType } from "../../common/types/infinity-pagination";
import { Route } from "../../routes/types/route";
import { VoyageItem } from "./voyage";

export type VoyageFindAndCheckExpirationResponse = {
  voyages: VoyageItem[];
  isExpired: boolean;
  expiredRoutes: Route["id"][];
};

export type InfinityPaginationVoyageFindAndCheckExpirationResponse =
  InfinityPaginationType<VoyageItem> &
    Omit<VoyageFindAndCheckExpirationResponse, "voyages">;
