import { OperatorNationality } from "./types/operator-nationality";

export const syncOperatorNationality = (
  departOperatorNationality: OperatorNationality[],
  returnOperatorNationality: OperatorNationality[]
): OperatorNationality[] =>
  returnOperatorNationality.flatMap((returnItem) => {
    const matchedDepartItem = departOperatorNationality.find(
      (departItem) =>
        departItem.national_id === returnItem.national_id ||
        departItem.name === returnItem.name ||
        departItem.abbrev === returnItem.abbrev
    );

    if (!matchedDepartItem) {
      return []; // Return empty array to skip this item
    }

    return [
      {
        base_national_id: returnItem.national_id,
        national_id: matchedDepartItem.national_id,
        name: matchedDepartItem.name,
        abbrev: matchedDepartItem.abbrev,
        default:
          matchedDepartItem.default !== returnItem.default
            ? matchedDepartItem.default
            : returnItem.default,
      },
    ];
  });
