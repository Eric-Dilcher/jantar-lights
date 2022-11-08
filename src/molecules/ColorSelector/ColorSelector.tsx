import React, { useRef } from "react";
import * as CSS from "csstype";
import { RGB } from "../../atoms/colorConfig";
import styles from "./ColorSelector.module.css";
import { SketchPicker } from "react-color";
import { useOpenToggle, useSelectElement } from "../../atoms/hooks";

type Props = {
  color: RGB;
  onColorChange: (color: RGB) => void;
  onSelectedChange: (selected: boolean) => void;
  size?: string; // any valid value for css width and height
};

export function ColorSelector({
  color,
  onColorChange,
  onSelectedChange,
  size = "20px",
}: Props) {
  const componentRef = useRef<null | HTMLDivElement>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useOpenToggle(componentRef);
  const isSelected = useSelectElement(componentRef);
  onSelectedChange(isSelected);

  const selectorStyles: CSS.Properties = {
    backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
    boxShadow: isSelected ? "0 0 5px blue" : undefined,
  };

  function onClick(e: React.MouseEvent): void {
    if (!e.ctrlKey && !e.metaKey) {
      // Prevent click event from closing the color picker immediately
      e.stopPropagation();
      setIsColorPickerOpen(!isColorPickerOpen);
    }
  }

  return (
    <div
      ref={componentRef}
      style={{ width: size, height: size }}
      className={styles.colorSelector}
    >
      <div
        style={selectorStyles}
        className={styles.colorDot}
        onClick={onClick}
      ></div>
      {isColorPickerOpen && (
        <div className={styles.colorPicker}>
          <SketchPicker
            color={color}
            onChange={(c) => onColorChange(c.rgb)}
            disableAlpha={true}
          ></SketchPicker>
        </div>
      )}
    </div>
  );
}
