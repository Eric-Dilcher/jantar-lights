import { createContext, useCallback, useEffect, useState } from "react";
import { throttle, isEqual } from "lodash-es";

export type DragCoordinates = [[number, number], [number, number]];

export interface DragInfo {
  coordinates: DragCoordinates;
  isDragging: boolean;
}

const defaultCoordinates: DragCoordinates = [
    [NaN, NaN],
    [NaN, NaN],
  ];

export const useDragInfo = (): DragInfo => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [[startCoord, endCoord], setStartEndCoordinates] =
    useState<DragCoordinates>(defaultCoordinates);
  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      setIsMouseDown(true);
      setStartEndCoordinates([
        [e.clientX, e.clientY],
        [e.clientX, e.clientY],
      ]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown, false);
    return () => window.removeEventListener("mousedown", onMouseDown, false);
  }, [onMouseDown]);

  useEffect(() => {
    if (isMouseDown) {
      const onMouseUp = (e: MouseEvent) => {
        if (e.button === 0) {
          setIsMouseDown(false);
          setStartEndCoordinates([
            [NaN, NaN],
            [NaN, NaN],
          ]);
        }
      };

      const onMouseMoveThrottled = throttle((e: MouseEvent) => {
        setStartEndCoordinates([startCoord, [e.clientX, e.clientY]]);
      }, 16);

      window.addEventListener("mouseup", onMouseUp, false);
      window.addEventListener("mousemove", onMouseMoveThrottled, false);
      return () => {
        console.log("removing")
        window.removeEventListener("mouseup", onMouseUp, false);
        window.removeEventListener("mousemove", onMouseMoveThrottled, false);
      };
    }
  }, [isMouseDown, startCoord]);

  const isDragging = isMouseDown && !isEqual(startCoord, endCoord);

  return {
    coordinates: isDragging ? [[...startCoord], [...endCoord]] : defaultCoordinates,
    isDragging: isDragging,
  };
};

export const DragInfoContext = createContext<DragInfo>({
  coordinates: [
    [NaN, NaN],
    [NaN, NaN],
  ],
  isDragging: false,
});
