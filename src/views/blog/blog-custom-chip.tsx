import { memo } from "react";

type Props = {
  label: string | JSX.Element;
  color?:
    | "primary"
    | "grey"
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "error";
};

const BlogCustomChip = ({ label, color = "primary" }: Props) => {
  return (
    <div
      className={`bg-${color}-100 text-${color} text-${color}-600 w-fit rounded-lg px-[10px] py-1 text-xs font-normal`}
    >
      {label}
    </div>
  );
};

export default memo(BlogCustomChip);
