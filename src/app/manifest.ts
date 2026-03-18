import {
  getEnvManifestSetting,
  getEnvWebsiteSettings,
} from "@/services/infrastructure/wordpress/queries/getEnvSettings";
import type { MetadataRoute } from "next";
import { themes } from "../../tailwind.config";
import { EnvWebsiteSettingEnum } from "@/services/infrastructure/wordpress/types/env-group.enum";

type ThemeKeys = keyof typeof themes;

function isThemeKey(key: string): key is ThemeKeys {
  return key in themes;
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const websiteSettings = await getEnvWebsiteSettings();
  const manifestSetting = await getEnvManifestSetting();
  const availableThemes = websiteSettings
    ?.find((setting) => setting.envkey === EnvWebsiteSettingEnum.THEMES)
    ?.value.split(",");
  let themeColor = "#000000";
  if (
    availableThemes &&
    availableThemes.length > 0 &&
    isThemeKey(availableThemes[0])
  ) {
    themeColor = themes[availableThemes[0]].colors.primary.DEFAULT;
  }
  if (manifestSetting) {
    let display: "fullscreen" | "standalone" | "minimal-ui" | "browser" =
      "standalone";
    if (manifestSetting.display && manifestSetting.display.length > 0) {
      display = manifestSetting.display as typeof display;
    }

    return {
      name: manifestSetting.name,
      short_name: manifestSetting.short_name,
      description: manifestSetting.description,
      start_url: manifestSetting.start_url,
      display: display,
      scope: manifestSetting.scope,
      background_color: "#ffffff",
      theme_color: themeColor,
      icons: manifestSetting.icon.map((icon) => ({
        src: icon.src.node.sourceUrl,
        sizes: icon.sizes,
        type: icon.type,
      })),
    };
  }

  return {
    name: "Con Dao Express",
    short_name: "Condao",
    description:
      "Trang đặt vé online tàu cao tốc đi Côn Đảo giá tốt, xuất vé điện tử tự động, phục vụ 24/7",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
