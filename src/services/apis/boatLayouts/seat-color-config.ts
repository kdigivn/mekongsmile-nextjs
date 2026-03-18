import { SeatColor, SeatColorWithType } from "./types/seat";

export const SEAT_COLOR_PALETTE: SeatColor[] = [
  {
    text: "text-seatEco-foreground hover:text-seatEco-foreground",
    background: "bg-gray-300 hover:bg-gray-300",
  },
  {
    text: "text-seatVip-foreground hover:text-seatVip-foreground",
    background: "bg-yellow-300 hover:bg-yellow-300",
  },
  {
    text: "text-seatBusiness-foreground hover:text-seatBusiness-foreground",
    background: "bg-blue-300 hover:bg-blue-300",
  },
  {
    text: "text-gray-900 hover:text-gray-900",
    background: "bg-orange-300 hover:bg-orange-300",
  },
  { text: "text-gray-900", background: "bg-amber-200 hover:bg-amber-200" },
  { text: "text-gray-900", background: "bg-lime-200 hover:bg-lime-200" },
  { text: "text-gray-900", background: "bg-cyan-200 hover:bg-cyan-200" },
  { text: "text-gray-900", background: "bg-violet-200 hover:bg-violet-200" },
  { text: "text-gray-900", background: "bg-pink-200 hover:bg-pink-200" },
  { text: "text-gray-900", background: "bg-orange-200 hover:bg-orange-200" },
  { text: "text-gray-900", background: "bg-teal-200 hover:bg-teal-200" },
  { text: "text-gray-900", background: "bg-sky-200 hover:bg-sky-200" },
  { text: "text-gray-900", background: "bg-indigo-200 hover:bg-indigo-200" },
  { text: "text-gray-900", background: "bg-rose-200 hover:bg-rose-200" },
  { text: "text-gray-900", background: "bg-[#f3dcacff] hover:bg-[#f3dcacff]" },
  { text: "text-gray-900", background: "bg-[#9cd9b5ff] hover:bg-[#9cd9b5ff]" },
  { text: "text-gray-900", background: "bg-[#ccafecff] hover:bg-[#ccafecff]" },
  { text: "text-gray-900", background: "bg-[#ffb4c4ff] hover:bg-[#ffb4c4ff]" },
  { text: "text-gray-900", background: "bg-[#f0fd97ff] hover:bg-[#f0fd97ff]" },
  { text: "text-gray-900", background: "bg-[#e8c17eff] hover:bg-[#e8c17eff]" },
  { text: "text-gray-900", background: "bg-[#b6fff6ff] hover:bg-[#b6fff6ff]" },
  { text: "text-gray-900", background: "bg-[#fff5abff] hover:bg-[#fff5abff]" },
  { text: "text-gray-900", background: "bg-[#b1dafcff] hover:bg-[#b1dafcff]" },
  { text: "text-gray-900", background: "bg-[#ffa9a9ff] hover:bg-[#ffa9a9ff]" },

  // {
  //   text: "text-black",
  //   background: "bg-amber-100",
  // },
  // {
  //   text: "text-black",
  //   background: "bg-violet-100",
  // },
  // {
  //   text: "text-black",
  //   background: "bg-green-100",
  // },
  // {
  //   text: "text-black",
  //   background: "bg-danger-100",
  // },
  // {
  //   text: "text-black",
  //   background: "bg-pink-100",
  // },
];

export const DEFAULT_SEAT_TYPE_COLOR_PALETTE: SeatColorWithType[] = [
  {
    seatType: "booked",
    text: "text-seatBooked-foreground hover:text-seatBooked-foreground",
    background: "bg-seatBooked hover:bg-seatBooked",
  },
  {
    seatType: "onHold",
    text: "text-seatOnHold-foreground hover:text-seatOnHold-foreground",
    background: "bg-seatOnHold hover:bg-seatOnHold",
  },
];
