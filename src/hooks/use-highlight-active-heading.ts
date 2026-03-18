import { useEffect, useState } from "react";

/**
 * Track headings on current page using IntersectionObserver and set active ID
 * @param setActiveId A state setter function to set active ID
 * @param postSelector A selector for the post wrapper element
 * @param headingSelector A selector for the headings to be tracked
 * @returns An object with the currently in-view heading ID
 */
const useHighLightActiveHeading = (
  postSelector: string = "",
  headingSelector: string = "h2,h3,h4,h5,h6"
) => {
  const isSSR = typeof window === "undefined";
  const [inViewId, setInViewId] = useState<string | undefined>();

  useEffect(() => {
    if (isSSR) return;

    const inViewSet = new Map<string, HTMLElement>();

    const callback: IntersectionObserverCallback = (changes) => {
      for (const change of changes) {
        if (change.isIntersecting) {
          if (change.target.id) {
            inViewSet.set(change.target.id, change.target as HTMLElement);
          }
        } else {
          inViewSet.delete(change.target.id);
        }
      }

      // Get in-view elements sorted by their offsetTop
      const inView = Array.from(inViewSet.entries())
        .filter(([id]) => !!id)
        .map(([id, el]) => [id, el.offsetTop] as [string, number]);

      if (inView.length > 0) {
        // Find the element with the smallest offsetTop (closest to the top)
        setInViewId(
          inView.reduce((acc, next) => (next[1] < acc[1] ? next : acc))[0]
        );
      }
    };

    const navHeight = "60"; // height of navbar in px

    const observer = new IntersectionObserver(callback, {
      rootMargin: `-${navHeight}px 0px -40% 0px`,
    });

    const postElement = document.querySelector(postSelector);
    if (postElement) {
      const headings = postElement.querySelectorAll(headingSelector);
      headings.forEach((element) => observer.observe(element));
    }

    return () => observer.disconnect();
  }, [isSSR, postSelector, headingSelector]);

  return { inViewId };
};

export default useHighLightActiveHeading;
