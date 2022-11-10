import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { UAParser } from "ua-parser-js";
import { debounce } from "lodash-es";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * A hook that will set isOpen to false when "Escape" is pressed, or the trigger element is blurred.
 * Note: toggledElementRef must refer to the element you want to toggle.
 * @param toggledElementRef
 * @returns
 */
export const useOpenToggle = (
  toggledElementRef: RefObject<HTMLElement | null>
): [isOpen: boolean, setIsOpen: (open: boolean) => void] => {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  const setIsOpenNextTurn = useCallback(
    // call setIsOpen during the next turn of the event loop, so that
    // if this function is called in response to a click, we don't immediately
    // close when the click event is handled by subtreeClickListener
    (isOpen: boolean) => window.setTimeout(() => setIsOpen(isOpen)),
    []
  );
  const subtreeClickListener = useCallback(
    (subtreeClicked: boolean) => {
      if (!subtreeClicked) {
        close();
      }
    },
    [close]
  );

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      const targetEl = toggledElementRef.current;
      const targets = e.composedPath();
      const targetClicked = targets.reduce(
        (prev, target) => prev || target === targetEl,
        false
      );
      subtreeClickListener(targetClicked);
    };
    window.addEventListener("click", onWindowClick, false);
    return () => {
      window.removeEventListener("click", onWindowClick, false);
    };
  }, [toggledElementRef, subtreeClickListener]);

  useEffect(() => {
    if (isOpen) {
      const keypressListener = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          close();
        }
      };

      window.addEventListener("keydown", keypressListener, false);
      return () => {
        window.removeEventListener("keydown", keypressListener, false);
      };
    }
  }, [isOpen, close]);

  return [isOpen, setIsOpenNextTurn];
};

export enum Platform {
  Windows,
  MacOS,
  Mobile,
  Other,
}
export const usePlatform = (): Platform => {
  const parser = useMemo(() => new UAParser(), []);
  return useMemo(() => {
    const platformName = parser.getOS().name ?? "";
    if (platformName === "Mac OS") {
      return Platform.MacOS;
    }
    if (platformName === "Windows") {
      return Platform.Windows;
    }
    if (
      [
        "Android",
        "BlackBerry",
        "iOS",
        "Windows Phone",
        "Windows Mobile",
      ].includes(platformName)
    ) {
      return Platform.Mobile;
    }
    return Platform.Other;
  }, [parser]);
};

export const useMoveIntoView = (
  ref: MutableRefObject<HTMLElement | null>,
  enabled: boolean,
  padding = 5 // padding in px
): void => {
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function calculateAndSetViewportSize(): void {
      const root = document.querySelector(":root")!;
      setViewportSize({ width: root.clientWidth, height: root.clientHeight });
    }
    calculateAndSetViewportSize();
    const debounced = debounce(calculateAndSetViewportSize, 300);
    window.addEventListener("resize", debounced, { passive: true });
    return () => window.removeEventListener("resize", debounced);
  }, []);

  useEffect(() => {
    if (enabled) {
      const el = ref.current!;
      const rect = el.getBoundingClientRect();

      const leftOverlap = Math.min(0, rect.left - padding);
      const rightOverlap = Math.min(
        0,
        viewportSize.width - padding - rect.right
      );
      if (leftOverlap < 0) {
        el.style.transform += ` translateX(${Math.abs(leftOverlap)}px)`;
      } else if (rightOverlap < 0) {
        el.style.transform += ` translateX(${rightOverlap}px)`;
      }

      const topOverlap = Math.min(0, rect.top - padding);
      const bottomOverlap = Math.min(
        0,
        viewportSize.height - padding - rect.bottom
      );
      if (topOverlap < 0) {
        el.style.transform = ` translateY(${Math.abs(topOverlap)}px)`;
      } else if (bottomOverlap < 0) {
        el.style.transform += ` translateY(${bottomOverlap}px)`;
      }
    }
  }, [ref, enabled, padding, viewportSize]);
};
