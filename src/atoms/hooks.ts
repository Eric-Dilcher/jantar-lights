import { MutableRefObject, useCallback, useContext, useEffect, useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { Dimensions, doOverlap, DragInfoContext } from "./dragInfo";
import { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useOnSubtreeClicked = (
  targetRef: MutableRefObject<HTMLElement | null>,
  onClick: (subtreeClicked: boolean) => void
): void => {
  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      const targetEl = targetRef.current;
      if (targetEl === null) {
        throw new Error("targetRef is not defined!");
      }
      const targets = e.composedPath();
      const targetClicked = targets.reduce(
        (prev, target) => prev || target === targetEl,
        false
      );
      onClick(targetClicked);
    };
    window.addEventListener("click", onWindowClick, false);
    return () => {
      window.removeEventListener("click", onWindowClick, false);
    };
  }, [targetRef, onClick]);
};

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
  const subtreeClickListener = useCallback(
    (subtreeClicked: boolean) => {
      if (!subtreeClicked) {
        close();
      }
    },
    [close]
  );
  useOnSubtreeClicked(toggledElementRef, subtreeClickListener);

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

  return [isOpen, setIsOpen];
};

export const useSelectElement = (
  selectableElementRef: MutableRefObject<HTMLElement | null>
): boolean => {
  const [isSelected, setIsSelected] = useState(false);
  const dragInfo = useContext(DragInfoContext);
  useEffect(() => {
    if (dragInfo.isDragging) {
      const elRect = selectableElementRef.current!.getBoundingClientRect();
      const elDims: Dimensions = [
        elRect.x,
        elRect.y,
        elRect.width,
        elRect.height,
      ];
      const selectedByDrag = doOverlap(dragInfo.dragValues, elDims);
      if (
        isSelected !== selectedByDrag &&
        (selectedByDrag || !dragInfo.ctrlMetaKey)
      ) {
        setIsSelected(selectedByDrag);
      }
    }
  }, [dragInfo, isSelected, selectableElementRef]);

  useEffect(() => {
    if (!dragInfo.isDragging) {
      const onClick = (e: MouseEvent) => {
        const thisEl = selectableElementRef.current;
        const targets = e.composedPath();
        const thisClicked = targets.reduce(
          (prev, target) => prev || target === thisEl,
          false
        );
        if (thisClicked && (e.ctrlKey || e.metaKey) && !isSelected) {
          setIsSelected(true);
        }
        if (!thisClicked && !(e.ctrlKey || e.metaKey) && isSelected) {
          setIsSelected(false);
        }
      };
      // evaluate on the next turn of the event loop so that we don't react to the click event
      // that is emitted at the same time as the mouseup event from the end of dragging.
      setTimeout(() => {
        window.addEventListener("click", onClick, false);
      });
      return () => {
        setTimeout(() => window.removeEventListener("click", onClick, false));
      };
    }
  }, [dragInfo, isSelected, selectableElementRef]);

  return isSelected;
};
