import React, { useCallback, useMemo, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { cloneDeep, isEqual } from "lodash-es";
import {
  setColorConfigRequest,
  getSolidColorConfig,
  RGB,
  ColorConfigSyncState,
  ColorConfig,
} from "../../atoms/colorConfig";
import { ColorSelector } from "../../molecules/ColorSelector/ColorSelector";
import {
  useAppDispatch,
  useAppSelector,
  useOpenToggle,
} from "../../atoms/hooks";
import styles from "./ConfigureLights.module.css";
import { getUniformLightsConfig, LightsConfig } from "../../atoms/lightsConfig";
import { DragRectangle } from "../../atoms/DragRectangle/DragRectangle";
import {
  DragInfoContext,
  useDragInfo,
  notDraggingDragInfo,
} from "../../atoms/dragInfo";

export function ConfigureLights() {
  const colorConfig = useAppSelector((state) => state.colorConfig);
  const appDispatch = useAppDispatch();
  const currentlySelectedRef = useRef<LightsConfig<boolean>>(
    getUniformLightsConfig(false)
  );
  const [currentColorsLocal, setCurrentColorsLocal] = useState<ColorConfig>(
    colorConfig.colors ??
      getSolidColorConfig({
        r: 255,
        g: 0,
        b: 0,
      })
  );
  const areAnySelected = currentlySelectedRef.current.flat().some((v) => v);
  const hasConfigChanged = useMemo(
    (): boolean => !isEqual(colorConfig.colors, currentColorsLocal),
    [colorConfig, currentColorsLocal]
  );
  const pickerAndTriggerRef = useRef<HTMLDivElement | null>(null);
  const [isGlobalColorPickerOpen, setIsGlobalColorPickerOpen] =
    useOpenToggle(pickerAndTriggerRef);
  const dragTargetRef = useRef<HTMLDivElement | null>(null);
  const dragInfo = useDragInfo(dragTargetRef);
  const getFirstSelectedColor = useCallback((): RGB => {
    const selected = currentlySelectedRef.current;
    for (const [i, row] of selected.entries()) {
      for (const [j, isSelected] of row.entries()) {
        if (isSelected) {
          return currentColorsLocal[i][j];
        }
      }
    }
    console.log(currentlySelectedRef.current);
    console.log(currentColorsLocal[0][0]);
    return currentColorsLocal[0][0];
  }, [currentColorsLocal]);

  function onColorChanged(row: number, col: number, color: RGB): void {
    const newConfig = cloneDeep(currentColorsLocal);
    newConfig[row][col] = color;
    setCurrentColorsLocal(newConfig);
  }

  function onSelectedChanged(
    row: number,
    col: number,
    selected: boolean
  ): void {
    currentlySelectedRef.current[row][col] = selected;
  }

  function onSetMultipleColorsClicked(e: React.MouseEvent): void {
    setIsGlobalColorPickerOpen(!isGlobalColorPickerOpen);
  }

  function onMultipleColorsChanged(color: RGB): void {
    if (!areAnySelected) {
      setCurrentColorsLocal(getSolidColorConfig(color));
    }
    setCurrentColorsLocal((currentColors): ColorConfig => {
      const newConfig = cloneDeep(currentColors);
      const selected = currentlySelectedRef.current;
      selected.forEach((row, i) =>
        row.forEach((isSelected, j) => {
          if (isSelected) {
            newConfig[i][j] = color;
          }
        })
      );
      return newConfig;
    });
  }

  function setColors(): void {
    appDispatch(setColorConfigRequest(currentColorsLocal));
  }

  return (
    <DragInfoContext.Provider
      // Prevent dragging to select lights underneath the color picker
      value={isGlobalColorPickerOpen ? notDraggingDragInfo : dragInfo}
    >
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Configure Lights</h2>
          <div className={"p-3 " + styles.lights} ref={dragTargetRef}>
            {colorConfig.syncState !== ColorConfigSyncState.Unsynced &&
              currentColorsLocal.map((row, i) => (
                <div className={styles.lights__row} key={i}>
                  {row.map((color, j) => (
                    <ColorSelector
                      size={"20px"}
                      key={j}
                      color={color}
                      onColorChange={(c) => onColorChanged(i, j, c)}
                      onSelectedChange={(v) => onSelectedChanged(i, j, v)}
                    ></ColorSelector>
                  ))}
                </div>
              ))}
            <DragRectangle />
          </div>

          <div
            className={"mt-4"}
            ref={pickerAndTriggerRef}
            // prevent clicks from clearing the selection
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onSetMultipleColorsClicked}
              className="btn btn-primary w-100"
            >
              {areAnySelected ? "Set selected lights" : "Set all lights"}
            </button>
            {isGlobalColorPickerOpen && (
              <div className={styles["lights__global-color-picker"]}>
                <SketchPicker
                  color={getFirstSelectedColor()}
                  onChange={(c) => onMultipleColorsChanged(c.rgb)}
                  disableAlpha={true}
                ></SketchPicker>
              </div>
            )}
          </div>
          <hr></hr>
          <button
            disabled={
              colorConfig.syncState !== ColorConfigSyncState.Synced ||
              !hasConfigChanged
            }
            className="btn btn-primary w-100 mb-3"
            onClick={setColors}
          >
            Apply Changes
          </button>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Back</Link>
      </div>
    </DragInfoContext.Provider>
  );
}
