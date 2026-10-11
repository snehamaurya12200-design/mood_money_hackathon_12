import { useEffect, useState, type RefObject } from "react";

export interface UseInViewOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useInView(
  targetRef: RefObject<Element | null>,
  options: UseInViewOptions = {}
): boolean {
  const { threshold = 0.05, root = null, rootMargin = "0%", freezeOnceVisible = false } = options;
  const [isInView, setIsInView] = useState<boolean>(true); // default true for immediate render

  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementInView = entry.isIntersecting;
        setIsInView(isElementInView);

        if (isElementInView && freezeOnceVisible) {
          observer.unobserve(target);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, threshold, root, rootMargin, freezeOnceVisible]);

  return isInView;
}
