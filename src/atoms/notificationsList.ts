import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { combineEpics, Epic } from "redux-observable";
import { of, EMPTY } from "rxjs";
import { filter, mergeMap, delay, map } from "rxjs/operators";

export interface NotificationData {
  message: string;
  variant: "success" | "danger" | "warning" | "info";
  // If no id is provided, one will be generated.
  id?: string;
  options?: Partial<{
    /** Autoclose delay in ms. 0 disables autoclose. Defaults to 6000 */
    delay: number;
  }>;
}

interface NotificationWithId extends NotificationData {
  id: string;
}

export interface NotificationsListState {
  notifications: NotificationWithId[];
}

const DEFAULT_AUTOCLOSE_DELAY = 6000 as const;

export const notificationsListSlice = createSlice({
  name: "notificationsList",
  initialState: { notifications: [] } as NotificationsListState,
  reducers: {
    addNotification(_state, _action: PayloadAction<NotificationData>): void {},
    _addNotificationWithId(
      state,
      action: PayloadAction<NotificationWithId>
    ): void {
      state.notifications.push(action.payload);
    },
    removeNotification(state, action: PayloadAction<string>): void {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const { addNotification, removeNotification } =
  notificationsListSlice.actions;

const { _addNotificationWithId } = notificationsListSlice.actions;

const addNotificationEpic: Epic = (action$) =>
  action$.pipe(
    filter(addNotification.match),
    map((action) => _addNotificationWithId({ ...action.payload, id: nanoid() }))
  );

const addNotificationWithIdEpic: Epic = (action$) =>
  action$.pipe(
    filter(_addNotificationWithId.match),
    mergeMap((action) => {
      const closeDelay = action.payload.options?.delay;
      if (closeDelay !== undefined && closeDelay === 0) {
        return EMPTY;
      }
      return of(removeNotification(action.payload.id)).pipe(
        delay(closeDelay ?? DEFAULT_AUTOCLOSE_DELAY)
      );
    })
  );

export const notificationsListEpic = combineEpics(
  addNotificationEpic,
  addNotificationWithIdEpic
);
