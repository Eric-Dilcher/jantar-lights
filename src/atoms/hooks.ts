import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { UAParser } from "ua-parser-js";

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
