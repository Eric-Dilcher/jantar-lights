import { useRef } from "react";
import * as CSS from "csstype";
import { RGB } from "../colorConfig";
import styles from "./ColorSelector.module.css";
import { SketchPicker } from "react-color";
import { useOpenToggle } from "../hooks";

type Props = {
  color: RGB;
  onColorChange: (color: RGB) => void;
  size?: string; // any valid value for css width and height
};

export function ColorSelector({ color, onColorChange, size = "20px" }: Props) {
  const pickerRef = useRef(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useOpenToggle(pickerRef);
  const selectorStyles: CSS.Properties = {
    backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
  };

  function onClick(): void {
    setIsColorPickerOpen(!isColorPickerOpen);
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={styles.colorSelector}
    >
      <div
        style={selectorStyles}
        className={styles.colorDot}
        onClick={onClick}
      ></div>
      {isColorPickerOpen && (
        <div ref={pickerRef} className={styles.colorPicker}>
          <SketchPicker
            color={color}
            onChange={(c) => onColorChange(c.rgb)}
          ></SketchPicker>
        </div>
      )}
    </div>
  );
}
