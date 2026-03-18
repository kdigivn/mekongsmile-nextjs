/**
 * Check if input value is a value of enum
 * @param enumObj Enum to be checked
 * @param value value to check
 * @returns true if value exist in enum, false if not
 */
export function isValueInEnum(
  enumObj: Record<string, unknown>,
  value: unknown
) {
  return Object.values(enumObj).includes(value);
}

/**
 * Check if input value is key of enum
 * @param enumObj Enum to be checked
 * @param key key to check
 * @returns true if key exist in enum, false if not
 */
export function isKeyInEnum(enumObj: Record<string, unknown>, key: string) {
  return Object.keys(enumObj).includes(key);
}

/**
 * Get all values in an enum
 * @param enumObj Enum object
 * @returns Array of values
 */
export function getEnumValues(enumObj: Record<string, unknown>) {
  return Object.values(enumObj);
}

/**
 * Get all keys in an enum
 * @param enumObj Enum object
 * @returns Array of values
 */
export function getEnumKeys(enumObj: Record<string, unknown>) {
  return Object.keys(enumObj);
}

/**
 * Get the enum key from input value
 * @param myEnum Enum object
 * @param enumValue Value to find
 * @returns Key of found, undefined if not
 */
export function getEnumKeyByEnumValue<
  R extends string | number,
  T extends { [key: string]: R },
>(myEnum: T, enumValue: T[keyof T]): string {
  const keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : "";
}

/**
 * Convert TypeScript enum to an array of key-value pairs.
 * @param enumObject Enum object
 * @returns Array of key-value pairs.
 */
export function enumToArray<T extends Record<string, string | number>>(
  enumObject: T
): Array<{ key: string; value: string | number }> {
  return (
    Object.entries(enumObject)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([key, value]) => isNaN(Number(key)))
      .map(([key, value]) => ({ key, value }))
  );
}
