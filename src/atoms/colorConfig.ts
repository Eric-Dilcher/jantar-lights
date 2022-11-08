import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { combineEpics, Epic } from "redux-observable";
import {
  OperatorFunction,
  Observable,
  catchError,
  filter,
  map,
  pairwise,
  switchMap,
  startWith,
  concatMap,
  withLatestFrom,
  of,
  from,
} from "rxjs";
import { RGBColor } from "react-color";

import { updateUser } from "./auth";
import { addNotification, NotificationData } from "./notificationsList";
import { FirebaseError } from "firebase/app";
import { getColorConfig, setColorConfig } from "./firestore";
import { getUniformLightsConfig, LightsConfig } from "./lightsConfig";

export type RGB = RGBColor;

export enum ColorConfigSyncState {
  Synced = "synced",
  PendingSync = "pending",
  Unsynced = "unsynced  ",
}

export type ColorConfig = LightsConfig<RGB>;

interface ColorConfigStateSyncedOrSyncing {
  colors: ColorConfig;
  syncState: ColorConfigSyncState.PendingSync | ColorConfigSyncState.Synced;
}

interface ColorConfigStateUnsynced {
  colors: null;
  syncState: ColorConfigSyncState.Unsynced;
}

export type ColorConfigState =
  | ColorConfigStateSyncedOrSyncing
  | ColorConfigStateUnsynced;

export const getSolidColorConfig = (c: RGB): ColorConfig => getUniformLightsConfig(c);

export const colorConfigSlice = createSlice({
  name: "colorConfig",
  initialState: {
    colors: null,
    syncState: ColorConfigSyncState.Unsynced,
  } as ColorConfigState,
  reducers: {
    _updateColorConfig(state, action: PayloadAction<ColorConfig>): void {
      state.colors = action.payload;
    },
    _syncPending(state): void {
      state.syncState = ColorConfigSyncState.PendingSync;
    },
    _syncResolution(
      state,
      _action: PayloadAction<NotificationData | undefined>
    ): void {
      state.syncState = ColorConfigSyncState.Synced;
    },
    _setColorConfig(_state, _action: PayloadAction<ColorConfig>): void {},
    setColorConfigRequest(_state, _action: PayloadAction<ColorConfig>): void {},
  },
});

export const { setColorConfigRequest } = colorConfigSlice.actions;

const { _updateColorConfig, _syncPending, _syncResolution, _setColorConfig } =
  colorConfigSlice.actions;

const syncResolutionEpic: Epic = (action$) =>
  action$.pipe(
    filter(_syncResolution.match),
    filter((action) => !!action.payload),
    map((action) => addNotification(action.payload!))
  );

function triggerSimpleSyncNotification(
  errorMessagePrefix: string,
  successMessage?: string
): OperatorFunction<unknown, PayloadAction<NotificationData | undefined>> {
  return (
    source$: Observable<unknown>
  ): Observable<PayloadAction<NotificationData | undefined>> => {
    return source$.pipe(
      map(() =>
        _syncResolution(
          successMessage
            ? { message: successMessage, variant: "success" }
            : undefined
        )
      ),
      startWith(_syncPending()),
      catchError((e: FirebaseError) => {
        console.error(e);
        return of(
          _syncResolution({
            message: [errorMessagePrefix, `Error: ${e.code}`],
            variant: "danger",
          })
        );
      })
    );
  };
}

const getStoredColorsEpic: Epic = (action$) =>
  action$.pipe(
    filter(updateUser.match),
    map((userAction) => userAction.payload),
    startWith(null),
    pairwise(),
    filter(([prev, cur]): boolean => !prev && !!cur),
    map(([_, cur]): string => cur!.uid),
    switchMap((uid) =>
      from(
        getColorConfig(uid, getSolidColorConfig({ r: 255, g: 0, b: 0 }))
      ).pipe(
        concatMap((config) =>
          of(_updateColorConfig(config)).pipe(
            triggerSimpleSyncNotification("Error getting stored lights.")
          )
        )
      )
    )
  );

const setColorConfigRequestEpic: Epic = (action$, state$) =>
  action$.pipe(
    filter(setColorConfigRequest.match),
    withLatestFrom(state$),
    filter(
      ([_, state]) =>
        state.colorConfig.syncState === ColorConfigSyncState.Synced
    ),
    map(([configPayload, _]) => _setColorConfig(configPayload.payload))
  );

const setColorConfigEpic: Epic = (action$, state$) =>
  action$.pipe(
    filter(_setColorConfig.match),
    withLatestFrom(state$),
    map(([configPayload, state]): [ColorConfig, string] => [
      configPayload.payload,
      state.auth.currentUser.uid,
    ]),
    switchMap(([config, uid]) =>
      from(setColorConfig(uid, config)).pipe(
        triggerSimpleSyncNotification(
          "Error configuring lights.",
          "Lights successfully configured!"
        )
      )
    )
  );

export const colorConfigEpic = combineEpics(
  getStoredColorsEpic,
  setColorConfigEpic,
  setColorConfigRequestEpic,
  syncResolutionEpic
);
