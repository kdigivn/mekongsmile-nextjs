import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import acceptLanguage from "accept-language";
import {
  fallbackLanguage,
  languages,
  cookieName,
} from "./services/i18n/config";

acceptLanguage.languages([...languages]);

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.includes("/api/") ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  if (process.env.INTERNATIONAL_ROUTING_ENABLED === "true") {
    let language;
    if (req.cookies.has(cookieName))
      language = acceptLanguage.get(req.cookies.get(cookieName)?.value);
    if (!language)
      language = acceptLanguage.get(req.headers.get("Accept-Language"));
    if (!language) language = fallbackLanguage;

    // Redirect if language in path is not supported
    if (!languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`))) {
      return NextResponse.redirect(
        new URL(
          `/${language}${req.nextUrl.pathname}${req.nextUrl.search}`,
          req.url
        )
      );
    }
  } else {
    const { pathname } = req.nextUrl;
    // Check if the pathname starts with a language prefix
    if (pathname.startsWith("/en/") || pathname.startsWith("/vi/")) {
      // Remove the language prefix from the pathname
      const newPathname = pathname.replace(/^\/[a-z]{2}\//, "/");
      // Redirect to the new pathname without the language prefix
      return NextResponse.redirect(new URL(newPathname, req.url));
    }
    // if (pathname.startsWith("/en") || pathname.startsWith("/vi")) {
    //   // Remove the language prefix from the pathname
    //   const newPathname = pathname.replace(/^\/[a-z]{2}/, "/");

    //   // Redirect to the new pathname without the language prefix
    //   return NextResponse.redirect(new URL(newPathname, req.url));
    // }
  }

  // if (req.headers.has("referer")) {
  //   const refererUrl = new URL(req.headers.get("referer") ?? "");
  //   const languageInReferer = languages.find((l) =>
  //     refererUrl.pathname.startsWith(`/${l}/`)
  //   );
  //   const response = NextResponse.next();
  //   if (languageInReferer) response.cookies.set(cookieName, languageInReferer);

  //   return response;
  // }

  return NextResponse.next();
}
