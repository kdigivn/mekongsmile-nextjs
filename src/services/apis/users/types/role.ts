export enum RoleEnum {
  ADMIN = 1,
  MANAGER = 5,
  STAFF = 10,
  USER = 20,
  SYSTEM_ADMIN = 999,
}

export type Role = {
  id: RoleEnum;
  name?: string;
};
