import { memo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import DropdownContent from "./dropdown-content";
import LinkBase from "../link-base";
import { ChildItem } from "@/services/infrastructure/wordpress/types/menu";

type MenuItemProps = {
  item: ChildItem;
};

const MenuItem = ({ item }: MenuItemProps) => {
  const hasChildren = (item.childItems?.nodes.length ?? 0) > 0;
  if (hasChildren) {
    return (
      <li className="group relative flex items-center justify-between gap-1 bg-white px-4 py-2 text-sm hover:bg-primary-100">
        <span>{item.label}</span>
        <IoIosArrowDown
          className="icon-arrow transition duration-150 ease-in-out group-hover:rotate-180"
          size={16}
        />
        <DropdownContent className="left-[200px] top-0 w-[200px]">
          {item.childItems &&
            item.childItems.nodes.map((subItem) => (
              <MenuItem key={subItem.id} item={subItem} />
            ))}
        </DropdownContent>
      </li>
    );
  } else {
    return (
      <li className="relative flex items-center justify-between gap-1 bg-white px-4 py-2 text-sm hover:bg-primary-100">
        <LinkBase href={item.path}>
          <span>{item.label}</span>
        </LinkBase>
      </li>
    );
  }
};
export default memo(MenuItem);
