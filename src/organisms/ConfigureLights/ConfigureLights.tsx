import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SketchPicker } from "react-color";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { isEqual } from "lodash-es";
import {
  setColorConfigRequest,
  ColorConfigSyncState,
  RGB,
  stripAlpha,
} from "../../atoms/colorConfig";
import { LightSelector } from "../../molecules/LightSelector/LightSelector";
import {
  Platform,
  useAppDispatch,
  useAppSelector,
  useOpenToggle,
  usePlatform,
} from "../../atoms/hooks";
import styles from "./ConfigureLights.module.css";
import {
  buildLightsConfig,
  iterateLightsConfig,
  mapLightsConfig,
} from "../../atoms/lightsConfig";
import { DragRectangle } from "../../atoms/DragRectangle/DragRectangle";
import {
  Dimensions,
  doOverlap,
  useDragInfo,
  DragInfoContext,
} from "../../atoms/dragInfo";

interface LightState {
  isSelected: boolean;
  color: RGB;
}

export function ConfigureLights() {
  const platform = usePlatform();
  const colorConfig = useAppSelector((state) => state.colorConfig);
  const appDispatch = useAppDispatch();

  // Light config related
  const currentLightsStates = buildLightsConfig((i, j) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState<LightState>({
      isSelected: false,
      color: colorConfig.colors?.[i][j] || {
        r: 255,
        g: 0,
        b: 0,
      },
    })
  );

  const lightsReferences = buildLightsConfig(() =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRef<HTMLDivElement | null>(null)
  );
  const areAnySelected = useMemo(
    (): boolean =>
      currentLightsStates.flat().some(([state]) => state.isSelected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...currentLightsStates.flat()]
  );
  const hasConfigChanged = useMemo(
    (): boolean =>
      !isEqual(
        colorConfig.colors,
        mapLightsConfig(currentLightsStates, ([state]) => state.color)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorConfig, ...currentLightsStates.flat()]
  );
  const firstSelectedColor = useMemo((): RGB => {
    let color = currentLightsStates[0][0][0].color;
    iterateLightsConfig(currentLightsStates, ([state]) => {
      if (state.isSelected) {
        color = state.color;
        return false;
      }
    });
    return color;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...currentLightsStates.flat()]);

  // multiple color picker related
  const pickerAndTriggerRef = useRef<HTMLDivElement | null>(null);
  const [isMultipleColorPickerOpen, setIsMultipleColorPickerOpen] =
    useOpenToggle(pickerAndTriggerRef);

  // drag to select related
  const allLightsRef = useRef<HTMLDivElement | null>(null);
  const dragInfo = useDragInfo(allLightsRef);

  useEffect(() => {
    if (dragInfo.isDragging) {
      function isOverlapped(row: number, col: number): boolean {
        const elRect =
          lightsReferences[row][col].current!.getBoundingClientRect();
        const elDims: Dimensions = [
          elRect.x,
          elRect.y,
          elRect.width,
          elRect.height,
        ];
        return doOverlap(dragInfo.dragValues, elDims);
      }

      iterateLightsConfig(currentLightsStates, ([state, setState], i, j) => {
        const overlapped = isOverlapped(i, j);
        setState({
          ...state,
          isSelected: !dragInfo.ctrlMetaKey
            ? overlapped
            : overlapped || state.isSelected,
        });
      });
    }
    // Need to only react to the draginfo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragInfo]);

  // click to select related

  const changeIsSelected = useCallback(
    (row: number, col: number, isSelected: boolean): void => {
      const [state, setState] = currentLightsStates[row][col];
      setState({ ...state, isSelected });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...currentLightsStates.flat()]
  );

  useEffect(() => {
    if (!dragInfo.isDragging) {
      const clickHandlers = mapLightsConfig(lightsReferences, (ref, i, j) => {
        return (e: MouseEvent) => {
          const targetEl = ref.current;
          const targets = e.composedPath();
          const targetClicked = targets.reduce(
            (prev, target) => prev || target === targetEl,
            false
          );
          if (targetClicked && (e.ctrlKey || e.metaKey)) {
            changeIsSelected(i, j, true);
          } else if (!targetClicked && !(e.ctrlKey || e.metaKey)) {
            changeIsSelected(i, j, false);
          }
        };
      });
      function onWindowClick(e: MouseEvent): void {
        iterateLightsConfig(clickHandlers, (handler) => handler(e));
      }
      const el = allLightsRef.current!;
      // Add listener during the next turn of the event loop so that the click event
      // associated with finishing the drag event isn't captured.
      setTimeout(() => el.addEventListener("click", onWindowClick, false));
      return () => {
        setTimeout(() => el.removeEventListener("click", onWindowClick, false));
      };
    }
  }, [dragInfo, lightsReferences, changeIsSelected]);

  // callbacks
  function onSingleColorChanged(row: number, col: number, color: RGB): void {
    const [state, setState] = currentLightsStates[row][col];
    setState({ ...state, color });
  }

  function onMultipleColorsChanged(color: RGB): void {
    iterateLightsConfig(currentLightsStates, ([state, setState]) => {
      if (state.isSelected || !areAnySelected) {
        setState({ ...state, color });
      }
    });
  }

  function onSetMultipleColorsClicked(): void {
    setIsMultipleColorPickerOpen(!isMultipleColorPickerOpen);
  }

  function onSetColorsClicked(): void {
    appDispatch(
      setColorConfigRequest(
        mapLightsConfig(currentLightsStates, ([state]) => state.color)
      )
    );
  }

  function onDiscardChangesClicked(): void {
    iterateLightsConfig(currentLightsStates, ([state, setState], i, j) =>
      setState({ ...state, color: colorConfig.colors?.[i][j] ?? state.color })
    );
  }

  return (
    <DragInfoContext.Provider value={dragInfo}>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-2">Configure Lights</h2>
          <p className="text-center mb-1">click to set a single color</p>
          <p className="text-center mb-1">
            {platform !== Platform.Mobile && (platform === Platform.MacOS ? "⌘+click or" : "ctrl+click or")} drag
            to select
          </p>
          <div className={"mt-4 " + styles.lights} ref={allLightsRef}>
            {colorConfig.syncState !== ColorConfigSyncState.Unsynced &&
              currentLightsStates.map((row, i) => (
                <div className={styles.lights__row} key={i}>
                  {row.map(([{ isSelected, color }], j) => (
                    <LightSelector
                      size={"20px"}
                      key={j}
                      color={color}
                      onColorChange={(c) => onSingleColorChanged(i, j, c)}
                      selected={isSelected}
                      ref={lightsReferences[i][j]}
                    ></LightSelector>
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
              className="btn btn-primary w-100 mb-2"
            >
              {areAnySelected ? "Set selected lights" : "Set all lights"}
            </button>
            {isMultipleColorPickerOpen && (
              <div className={styles["lights__global-color-picker"]}>
                <SketchPicker
                  color={firstSelectedColor}
                  onChange={(c) => onMultipleColorsChanged(stripAlpha(c.rgb))}
                  disableAlpha={true}
                ></SketchPicker>
              </div>
            )}
          </div>
          <button
            disabled={
              colorConfig.syncState !== ColorConfigSyncState.Synced ||
              !hasConfigChanged
            }
            className="btn btn-primary w-100"
            onClick={onDiscardChangesClicked}
          >
            Discard Changes
          </button>

          <hr></hr>

          <button
            disabled={
              colorConfig.syncState !== ColorConfigSyncState.Synced ||
              !hasConfigChanged
            }
            className="btn btn-primary w-100 mb-3"
            onClick={onSetColorsClicked}
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
