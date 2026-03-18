/**
 *
 * @param strTime
 * @returns
 *
 * input: 08:00:00 -> output: 08:00
 * input: 08:00 -> output: 08:00
 */
export const formatStringTime = (strTime: string | undefined): string => {
  // Handle base case
  if (!strTime) {
    return "";
  }
  let resTime: string = strTime;
  // Case: "08:00:00"
  if (strTime && strTime.length === 8) {
    resTime = strTime.slice(0, 5); // "08:00"
  }
  return resTime;
};
