import { Action, combineReducers, configureStore } from "@reduxjs/toolkit";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import { authEpic, authSlice } from "./auth";
import { colorConfigEpic, colorConfigSlice } from "./colorConfig";
import {
  notificationsListEpic,
  notificationsListSlice,
} from "./notificationsList";

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [notificationsListSlice.name]: notificationsListSlice.reducer,
  [colorConfigSlice.name]: colorConfigSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
// TODO: Fix typing of AppDispatch so that it isn't "AnyAction"
export type AppDispatch = typeof store.dispatch;

const epicMiddleware = createEpicMiddleware<Action, Action, RootState>();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(epicMiddleware),
});

const rootEpic = combineEpics(colorConfigEpic, authEpic, notificationsListEpic);
epicMiddleware.run(rootEpic);
