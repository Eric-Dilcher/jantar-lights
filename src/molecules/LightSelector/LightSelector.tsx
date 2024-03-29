import React, { forwardRef, MutableRefObject, useRef } from "react";
import * as CSS from "csstype";
import { RGB, stripAlpha } from "../../atoms/colorConfig";
import styles from "./LightSelector.module.css";
import { SketchPicker } from "react-color";
import { useMoveIntoView, useOpenToggle } from "../../atoms/hooks";

type Props = {
  color: RGB;
  onColorChange: (color: RGB) => void;
  selected: boolean;
  size?: string; // any valid value for css width and height
};

export const LightSelector = forwardRef<HTMLDivElement, Props>(
  ({ color, onColorChange, selected, size = "20px" }: Props, ref) => {
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const [isColorPickerOpen, setIsColorPickerOpen] =
      useOpenToggle(pickerRef as MutableRefObject<HTMLDivElement>);
    useMoveIntoView(pickerRef, isColorPickerOpen)

    const selectorStyles: CSS.Properties = {
      backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
      boxShadow: selected ? "0 0 5px blue" : undefined,
    };

    function onClick(e: React.MouseEvent): void {
      if (!e.ctrlKey && !e.metaKey) {
        setIsColorPickerOpen(!isColorPickerOpen);
      }
    }

    return (
      <div
        ref={ref}
        style={{ width: size, height: size }}
        className={styles.lightSelector}
      >
        <div
          style={selectorStyles}
          className={styles.colorDot}
          onClick={onClick}
        ></div>
        {isColorPickerOpen && (
          <div className={styles.colorPicker} ref={pickerRef}>
            <SketchPicker
              color={color}
              onChange={(c) => onColorChange(stripAlpha(c.rgb))}
              disableAlpha={true}
            ></SketchPicker>
          </div>
        )}
      </div>
    );
  }
);
