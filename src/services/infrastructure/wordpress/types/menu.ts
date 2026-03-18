export type ChildItem = {
  id: string;
  label: string;
  parentId: string;
  path: string;
  uri: string;
  childItems?: {
    nodes: ChildItem[];
  };
};

export type Menu = {
  menu: {
    menuItems: MenuItems;
  };
};

export type Menus = {
  menus: {
    nodes: [{ menuItems: MenuItems }];
  };
};

export type MenuItems = {
  nodes: ChildItem[];
};
