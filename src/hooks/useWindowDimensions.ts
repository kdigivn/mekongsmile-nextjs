import { useEffect, useState } from "react";

function getWindowDimensions() {
  if (typeof window === "undefined") return { width: 0, height: 0 };

  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

/**
 * Determine height and width of window screen
 * @returns
 */
export default function useWindowDimensions() {
  const isSSR = typeof window === "undefined";

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    if (isSSR) return;

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => {
      if (isSSR) return;

      window.removeEventListener("resize", handleResize);
    };
  }, [isSSR]);

  return windowDimensions;
}
