export type Location = {
  id: string;
  location_name: string;
  parent_id: string | null;
  is_root: boolean;
  abbreviation: string;
  disable: boolean;
  longitude?: number; // Tọa độ kinh độ
  latitude?: number; // Tọa độ vĩ độ
};
