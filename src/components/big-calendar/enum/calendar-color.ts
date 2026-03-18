export type OperatorColorCalendar = {
  colorEvento: string;
  color: string;
};

export const BigCalendarOperatorColor: Record<
  "superdong" | "greenlines" | "phuquocexpress" | "lightning68" | "default",
  OperatorColorCalendar
> = {
  superdong: {
    colorEvento: "#2596be",
    color: "white",
  },
  greenlines: {
    colorEvento: "#00552b",
    color: "white",
  },
  phuquocexpress: {
    colorEvento: "#d43727",
    color: "white",
  },
  lightning68: {
    colorEvento: "#8cc438",
    color: "white",
  },
  default: {
    colorEvento: "blue",
    color: "white",
  },
};
