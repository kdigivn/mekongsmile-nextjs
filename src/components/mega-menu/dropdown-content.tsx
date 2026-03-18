import { memo, ReactNode } from "react";

export type DropdownContentProps = {
  children: ReactNode;
  className?: string;
};

const DropdownContent = ({ children, className }: DropdownContentProps) => (
  <ul className={`absolute hidden group-hover:block ${className} text-black`}>
    {children}
  </ul>
);

export default memo(DropdownContent);
