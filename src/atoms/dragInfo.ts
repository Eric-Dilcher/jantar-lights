import { MutableRefObject, useEffect, useState, createContext } from "react";
import {
  of,
  fromEvent,
  filter,
  switchMap,
  startWith,
  merge,
  map,
  scan,
  Observable,
  throttleTime,
  distinctUntilChanged,
} from "rxjs";
import { isEqual } from "lodash-es";

export type Dimensions = [x: number, y: number, width: number, height: number];

export interface DragInfo {
  dragValues: Dimensions;
  isDragging: boolean;
  ctrlMetaKey: boolean;
}

export const notDraggingDragInfo: DragInfo = Object.freeze({
  dragValues: [NaN, NaN, NaN, NaN],
  isDragging: false,
  ctrlMetaKey: false,
} as DragInfo);
/** [x, y] */
type Coordinate = [number, number];
/** [coordinate, ctrl or meta pressed] */
type CoordinateAndKey = [Coordinate, boolean];
/** [start, end, ctrl or meta pressed] */
type DragCoordinatesAndKey = [Coordinate, Coordinate, boolean];

const defaultCoordinates: DragCoordinatesAndKey = [
  [NaN, NaN],
  [NaN, NaN],
  false,
];

const DEFAULT_DRAG_DISTANCE = 3 as const;
const DEFAULT_THROTTLE_TIME = 16 as const; // 16 ms ~= 60fps

function getDragInfoObservable(
  targetRef: MutableRefObject<HTMLElement | null>,
  dragDistance: number = DEFAULT_DRAG_DISTANCE,
  dragThrottle: number = DEFAULT_THROTTLE_TIME
): Observable<DragInfo> {
  const targetEl = targetRef.current;
  if (!targetEl) {
    throw new Error("targetRef is not defined!");
  }

  const mouseDown$ = fromEvent<PointerEvent>(targetEl, "pointerdown").pipe(
    filter((e) => e.button === 0 && e.isPrimary)
  );

  // listen to mouseup on the window object in order to properly
  // stop dragging even if the mouse left the drag target. 
  const mouseUp$ = fromEvent<PointerEvent>(window, "pointerup").pipe(
    filter((e) => e.button === 0 && e.isPrimary)
  );

  const mouseMove$ = fromEvent<PointerEvent>(targetEl, "pointermove").pipe(
    filter((e) => e.isPrimary)
  );

  const isMouseDown$ = merge(
    mouseDown$.pipe(map(() => true)),
    mouseUp$.pipe(map(() => false))
  );

  const dragCoord$ = isMouseDown$.pipe(
    switchMap((isMouseDown) =>
      isMouseDown
        ? mouseMove$.pipe(
            throttleTime(dragThrottle),
            map(
              (e): CoordinateAndKey => [
                [e.clientX, e.clientY],
                e.ctrlKey || e.metaKey,
              ]
            ),
            scan((acc, coord): DragCoordinatesAndKey => {
              if (acc === defaultCoordinates) {
                return [coord[0], coord[0], coord[1]];
              }
              return [acc[0], coord[0], acc[2] || coord[1]];
            }, defaultCoordinates)
          )
        : of(defaultCoordinates)
    ),
    startWith(defaultCoordinates)
  );
  return dragCoord$.pipe(
    map((coords) => coordsToInfo(coords, dragDistance)),
    distinctUntilChanged(isEqual)
  );
}

function coordsToInfo(
  [start, end, ctrlMetaKey]: DragCoordinatesAndKey,
  dragDistance: number
): DragInfo {
  const isMouseDown = [...start, ...end].every((v) => isFinite(v));
  if (!isMouseDown) {
    return notDraggingDragInfo;
  }
  const x = Math.min(start[0], end[0]);
  const y = Math.min(start[1], end[1]);
  const width = Math.abs(start[0] - end[0]);
  const height = Math.abs(start[1] - end[1]);
  const isDragging = width >= dragDistance || height >= dragDistance;
  if (!isDragging) {
    return notDraggingDragInfo;
  }
  return {
    isDragging: true,
    dragValues: [x, y, width, height],
    ctrlMetaKey,
  };
}

export const useDragInfo = (
  targetRef: MutableRefObject<HTMLElement | null>
): DragInfo => {
  const [dragInfo, setDragInfo] = useState<DragInfo>(notDraggingDragInfo);
  useEffect(() => {
    const sub = getDragInfoObservable(targetRef).subscribe(setDragInfo);
    return () => sub.unsubscribe();
  }, [targetRef]);
  return dragInfo;
};

export const DragInfoContext = createContext(notDraggingDragInfo)

export function doOverlap(a: Dimensions, b: Dimensions): boolean {
  return (
    a[0] < b[0] + b[2] &&
    a[0] + a[2] > b[0] &&
    a[1] < b[1] + b[3] &&
    a[1] + a[3] > b[1]
  );
}
