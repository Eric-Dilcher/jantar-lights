import { useContext } from "react";
import { DragInfoContext } from "../dragInfo";
import styles from "./DragRectangle.module.css";


export function DragRectangle() {
  const {dragValues: [left, top, width, height], isDragging} = useContext(DragInfoContext);
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
