"use client";
import { memo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import DropdownContent from "./dropdown-content";
import MenuItem from "./menu-item";
import { ChildItem } from "@/services/infrastructure/wordpress/types/menu";

type MegaMenuProps = {
  name: string;
  listChild: ChildItem[];
};

const MegaMenu = ({ name, listChild }: MegaMenuProps) => {
  return (
    <div className="group relative inline-block">
      <button className="flex items-center justify-between gap-1 rounded px-4 py-2 text-black">
        <span className="text-sm">{name}</span>
        <IoIosArrowDown
          className="icon-arrow transition duration-150 ease-in-out group-hover:rotate-180"
          size={16}
        />
      </button>
      <DropdownContent className="w-[200px] pt-1">
        {listChild.map((child) => (
          <MenuItem key={child.id} item={child} />
        ))}
      </DropdownContent>
    </div>
  );
};

export default memo(MegaMenu);
