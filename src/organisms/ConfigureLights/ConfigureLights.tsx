import { useMemo, useRef, useState } from "react";
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
import { ColorSelector } from "../../atoms/ColorSelector/ColorSelector";
import {
  useAppDispatch,
  useAppSelector,
  useOpenToggle,
} from "../../atoms/hooks";
import styles from "./ConfigureLights.module.css";

export function ConfigureLights() {
  const colorConfig = useAppSelector((state) => state.colorConfig);
  const appDispatch = useAppDispatch();
  const [currentColorsLocal, setCurrentColorsLocal] = useState<ColorConfig>(
    colorConfig.colors ??
      getSolidColorConfig({
        r: 255,
        g: 0,
        b: 0,
      })
  );
  const hasConfigChanged = useMemo(
    (): boolean => !isEqual(colorConfig.colors, currentColorsLocal),
    [colorConfig, currentColorsLocal]
  );
  const pickerRef = useRef(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useOpenToggle(pickerRef);

  function onColorChanged(row: number, col: number, color: RGB): void {
    const newConfig = cloneDeep(currentColorsLocal);
    newConfig[row][col] = color;
    setCurrentColorsLocal(newConfig);
  }

  function onSetAllColorsClicked(): void {
    setIsColorPickerOpen(!isColorPickerOpen);
  }

  function onAllColorsChanged(color: RGB): void {
    setCurrentColorsLocal(getSolidColorConfig(color));
  }

  function setColors(): void {
    appDispatch(setColorConfigRequest(currentColorsLocal));
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Configure Lights</h2>
          <div className={styles.lights}>
            {colorConfig.syncState !== ColorConfigSyncState.Unsynced &&
              currentColorsLocal.map((row, i) => (
                <div className={styles.lights__row} key={i}>
                  {row.map((color, j) => (
                    <ColorSelector
                      size={"20px"}
                      key={j}
                      color={color}
                      onColorChange={(c) => onColorChanged(i, j, c)}
                    ></ColorSelector>
                  ))}
                </div>
              ))}
          </div>
          <div tabIndex={-1} className={"mt-4"}>
            <button
              onClick={onSetAllColorsClicked}
              className="btn btn-primary w-100"
            >
              Set all colors
            </button>
            {isColorPickerOpen && (
              <div
                className={styles["lights__global-color-picker"]}
                ref={pickerRef}
              >
                <SketchPicker
                  color={currentColorsLocal[0][0]}
                  onChange={(c) => onAllColorsChanged(c.rgb)}
                ></SketchPicker>
              </div>
            )}
          </div>
          <hr></hr>
          <button
            disabled={colorConfig.syncState !== ColorConfigSyncState.Synced || !hasConfigChanged}
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
    </>
  );
}
