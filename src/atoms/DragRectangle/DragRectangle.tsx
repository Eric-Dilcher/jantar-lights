import { useContext } from "react";
import { DragInfoContext } from "../dragInfo";
import styles from "./DragRectangle.module.css";

export function DragRectangle() {
  const {
    isDragging,
    coordinates: [start, end],
  } = useContext(DragInfoContext);
  const left = Math.min(start[0], end[0]);
  const top = Math.min(start[1], end[1]);
  const width = Math.max(start[0], end[0]) - left;
  const height = Math.max(start[1], end[1]) - top;
  return (
    <>
      {isDragging && (
        <div
          style={{
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={styles["drag-rectangle"]}
        ></div>
      )}
    </>
  );
}
