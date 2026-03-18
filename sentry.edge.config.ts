// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV !== "development")
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 0.5,

    // Set the environment & release version
    environment: process.env.NODE_ENV,
    release: `${process.env.npm_package_name}@${process.env.npm_package_version}`,

    // Disable transport in development, transaction are still captured in debug mode, check the console
    enabled: true,
    // enableTracing: true,

    // Enable debug mode to log event submission
    debug: process.env.ENABLE_SENTRY_DEBUG === "true",
  });
