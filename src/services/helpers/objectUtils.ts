export const objectToArray = <T>(obj: {
  [key: string]: T;
}): Array<{ key: string; value: T }> => {
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
};
