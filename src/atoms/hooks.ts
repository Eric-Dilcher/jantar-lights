import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
/**
 * A hook that will set isOpen to false when "Escape" is pressed, or the trigger element is blurred.
 * Note: toggledElementRef must refer to the element you want to toggle.
 * @param toggledElementRef
 * @returns
 */
export const useOpenToggle = (
  toggledElementRef: MutableRefObject<HTMLElement | null>
): [isOpen: boolean, setIsOpen: (open: boolean) => void] => {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  const checkTabIndex = useCallback((el: HTMLElement) => {
    const tabIndex = el.getAttribute("tabindex");
    if (!tabIndex) {
      el.setAttribute("tabindex", "-1");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const keypressListener = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          close();
        }
      };
      const toggledEl = toggledElementRef.current;
      if (toggledEl === null) {
        console.log(
          "toggledElementRef is not defined! Cannot auto-close toggled element on click."
        );
      }
      window.addEventListener("keydown", keypressListener, false);
      toggledEl && checkTabIndex(toggledEl);
      toggledEl?.addEventListener("blur", close, false);
      toggledEl?.focus();

      return () => {
        window.removeEventListener("keydown", keypressListener, false);
        toggledEl?.removeEventListener("blur", close, false);
      };
    }
  }, [toggledElementRef, isOpen, close, checkTabIndex]);

  return [isOpen, setIsOpen];
};
