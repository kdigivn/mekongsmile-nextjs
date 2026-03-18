export const textAlignOptions = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function getTextAlign(
  alignment: keyof typeof textAlignOptions = "left"
) {
  return textAlignOptions[alignment];
}

export const getFontSizeForHeading = (level: 1 | 2 | 3 | 4 | 5 | 6): string => {
  const fontSizeMap: { [key in 1 | 2 | 3 | 4 | 5 | 6]: string } = {
    1: "text-6xl",
    2: "text-5xl",
    3: "text-4xl",
    4: "text-3xl",
    5: "text-2xl",
    6: "text-xl",
  };

  return fontSizeMap[level] || "";
};

export const getRouteBackgroundColor = (routeId: string | number) => {
  const id = parseInt(routeId.toString(), 10);

  if (Number.isNaN(id)) {
    return "bg-gray-200";
  }

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-lime-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-rose-500",
  ];

  return colors[(id - 1) % colors.length];
};
