import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import * as tailwindcssAnimate from "tailwindcss-animate";

export const themes = {
  light: {
    colors: {
      background: "#ffffff",
      foreground: "#000000",
      focus: "#f4f6f8",
      default: {
        DEFAULT: "#919eab",
        foreground: "#000000",
        "100": "#f9fafb",
        "200": "#f4f6f8",
        "300": "#dfe3e8",
        "400": "#c4cdd5",
        "500": "#919eab",
        "600": "#637381",
        "700": "#454f5b",
        "800": "#212b36",
        "900": "#161c24",
      },
      primary: {
        DEFAULT: "#218721",
        foreground: "#ffffff",
        "100": "#e0f9d3",
        "200": "#bcf3a9",
        "300": "#88db77",
        "400": "#58b74f",
        "500": "#218721",
        "600": "#187420",
        "700": "#10611e",
        "800": "#0a4e1c",
        "900": "#06401a",
      },
      success: {
        DEFAULT: "#1d8719",
        "100": "#dff9d0",
        "200": "#baf3a3",
        "300": "#85db6f",
        "400": "#54b747",
        "500": "#1d8719",
        "600": "#127416",
        "700": "#0c6117",
        "800": "#074e17",
        "900": "#044016",
      },
      warning: {
        DEFAULT: "#e89d06",
        "100": "#fdf4cc",
        "200": "#fce69a",
        "300": "#f8d167",
        "400": "#f1bc40",
        "500": "#e89d06",
        "600": "#c78004",
        "700": "#a76503",
        "800": "#864c01",
        "900": "#6f3b01",
      },
      danger: {
        DEFAULT: "#ff5630",
        "100": "#ffe9d5",
        "200": "#ffceac",
        "300": "#ffac82",
        "400": "#ff8b63",
        "500": "#ff5630",
        "600": "#db3723",
        "700": "#b71d18",
        "800": "#930f14",
        "900": "#7a0916",
      },
    },
  },
  "condao-express-light": {
    colors: {
      background: "#ffffff",
      foreground: "#000000",
      focus: "#f4f6f8",
      default: {
        DEFAULT: "#919eab",
        foreground: "#000000",
        "100": "#f9fafb",
        "200": "#f4f6f8",
        "300": "#dfe3e8",
        "400": "#c4cdd5",
        "500": "#919eab",
        "600": "#637381",
        "700": "#454f5b",
        "800": "#212b36",
        "900": "#161c24",
      },
      primary: {
        DEFAULT: "#2e3199",
        foreground: "#ffffff",
        "100": "#d6d8f9",
        "200": "#b0b2f4",
        "300": "#8285e0",
        "400": "#5c5fc1",
        "500": "#2e3199",
        "600": "#212483",
        "700": "#17196e",
        "800": "#0e1058",
        "900": "#080949",
      },
      success: {
        DEFAULT: "#1d8719",
        "100": "#dff9d0",
        "200": "#baf3a3",
        "300": "#85db6f",
        "400": "#54b747",
        "500": "#1d8719",
        "600": "#127416",
        "700": "#0c6117",
        "800": "#074e17",
        "900": "#044016",
      },
      warning: {
        DEFAULT: "#e89d06",
        "100": "#fdf4cc",
        "200": "#fce69a",
        "300": "#f8d167",
        "400": "#f1bc40",
        "500": "#e89d06",
        "600": "#c78004",
        "700": "#a76503",
        "800": "#864c01",
        "900": "#6f3b01",
      },
      danger: {
        DEFAULT: "#ff5630",
        "100": "#ffe9d5",
        "200": "#ffceac",
        "300": "#ffac82",
        "400": "#ff8b63",
        "500": "#ff5630",
        "600": "#db3723",
        "700": "#b71d18",
        "800": "#930f14",
        "900": "#7a0916",
      },
    },
  },
};

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      boxShadow: {
        cardHover:
          "0.9px 0.9px 2.2px -32px rgba(0, 0, 0, 0.02), 2.1px 2.1px 5.3px -32px rgba(0, 0, 0, 0.028), 4px 4px 10px -32px rgba(0, 0, 0, 0.035), 7.1px 7.1px 17.9px -32px rgba(0, 0, 0, 0.042), 13.4px 13.4px 33.4px -32px rgba(0, 0, 0, 0.05), 32px 32px 80px -32px rgba(0, 0, 0, 0.07)",
      },
      colors: {
        info: {
          100: "#d0e2fd",
          200: "#a3c2fc",
          300: "#749ff8",
          400: "#5180f1",
          500: "#1b52e8",
          600: "#133ec7",
          700: "#0d2ea7",
          800: "#081f86",
          900: "#05156f",
          DEFAULT: "#1b52e8",
        },
        /**
         * Shadcn colors
         */
        // Default border color
        border: "hsl(var(--heroui-default-300))",
        // Border color for inputs such as <Input />, <Select />, <Textarea />
        input: "hsl(var(--heroui-default-400))",
        // Used for focus ring
        ring: "hsl(var(--heroui-primary))",
        // Default background color of <body />...etc
        pageBackground: "hsl(var(--heroui-default-200))",
        // We do not use these color of shadcn as nextui has already defined it
        // // Default background color of <body />...etc
        // background: "hsl(var(--background))",
        // // Default foreground color of text
        // foreground: "hsl(var(--foreground))",
        // primary: {
        //   // Primary color for <Button />
        //   DEFAULT: "hsl(var(--heroui-primary))",
        //   // Primary foreground color for <Button />
        //   foreground: "hsl(var(--heroui-primary-foreground))",
        // },
        // Used for destructive actions such as <Button variant="destructive">
        destructive: {
          DEFAULT: "hsl(var(--heroui-danger))",
          // Foreground color for destructive actions
          foreground: "hsl(var(--heroui-danger-foreground))",
        },
        muted: {
          // Muted backgrounds such as <TabsList />, <Skeleton />, <Switch />
          DEFAULT: "hsl(var(--muted))",
          // Muted foreground color
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          // Used for accents such as hover effects on <DropdownMenuItem>, <SelectItem>, etc.
          DEFAULT: "hsl(var(--accent))",
          // Foreground color for accents
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          // Background color for popovers such as <DropdownMenu />, <HoverCard />, <Popover />
          DEFAULT: "hsl(var(--popover))",
          // Foreground color for popovers
          foreground: "hsl(var(--popover-foreground))",
        },
        tooltip: {
          // Tooltip background color
          DEFAULT: "hsl(var(--tooltip))",
          // Tooltip foreground color
          foreground: "hsl(var(--tooltip-foreground))",
        },
        card: {
          // Background color for <Card />
          DEFAULT: "hsl(var(--heroui-background))",
          // Foreground color for <Card />
          foreground: "hsl(var(--heroui-foreground))",
        },
        // Ferry Seat colors
        seatDefault: {
          DEFAULT: "hsl(var(--seat-default) / <alpha-value>)",
          foreground: "hsl(var(--seat-default-foreground) / <alpha-value>)",
        },
        seatBooked: {
          DEFAULT: "hsl(var(--seat-booked) / <alpha-value>)",
          foreground: "hsl(var(--seat-booked-foreground) / <alpha-value>)",
        },
        seatOnHold: {
          DEFAULT: "hsl(var(--seat-onHold) / <alpha-value>)",
          foreground: "hsl(var(--seat-onHold-foreground) / <alpha-value>)",
        },
        seatEco: {
          DEFAULT: "hsl(var(--seat-eco) / <alpha-value>)",
          foreground: "hsl(var(--seat-eco-foreground) / <alpha-value>)",
        },
        seatVip: {
          DEFAULT: "hsl(var(--seat-vip) / <alpha-value>)",
          foreground: "hsl(var(--seat-vip-foreground) / <alpha-value>)",
        },
        seatBusiness: {
          DEFAULT: "hsl(var(--seat-business) / <alpha-value>)",
          foreground: "hsl(var(--seat-business-foreground) / <alpha-value>)",
        },
        seatPresident: {
          DEFAULT: "hsl(var(--seat-president) / <alpha-value>)",
          foreground: "hsl(var(--seat-president-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          to: { transform: "translateX(-1260px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration, 60s) linear infinite",
      },
    },
  },
  plugins: [
    heroui({
      themes,
    }),
    tailwindcssAnimate,
  ],
} satisfies Config;

export default config;
