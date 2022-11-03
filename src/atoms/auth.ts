import { from, of, forkJoin, Observable, OperatorFunction } from "rxjs";
import {
  filter,
  switchMap,
  map,
  catchError,
  withLatestFrom,
  startWith,
} from "rxjs/operators";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import app from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  User,
  signOut,
  updateEmail,
  updatePassword,
  Unsubscribe,
  getAuth,
} from "firebase/auth";
import { combineEpics, Epic } from "redux-observable";
import { Dispatch } from "react";
import { FirebaseError } from "firebase/app";
import { addNotification, NotificationData } from "./notificationsList";

const auth = getAuth(app);

export enum AuthStatus {
  Ready,
  Pending,
}

export interface AuthState {
  /** Value is null if user is not logged in */
  currentUser: User | null;
  status: AuthStatus;
}

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: null,
    status: AuthStatus.Ready,
  } as AuthState,
  reducers: {
    _authPending(state): void {
      state.status = AuthStatus.Pending;
    },
    _authResolution(
      state,
      _action: PayloadAction<NotificationData | undefined>
    ): void {
      state.status = AuthStatus.Ready;
    },
    /* This action should not be dispatched outside of this file */
    updateUser(state, action: PayloadAction<User | null>): void {
      state.currentUser = action.payload;
    },
    loginRequest(
      _state,
      _action: PayloadAction<{ email: string; password: string }>
    ): void {},
    signupRequest(
      _state,
      _action: PayloadAction<{ email: string; password: string }>
    ): void {},
    logoutRequest(_state): void {},
    resetPasswordRequest(_state, _action: PayloadAction<string>): void {},
    accountUpdateRequest(
      _state,
      _action: PayloadAction<{ email?: string; password?: string }>
    ): void {},
  },
});

export const {
  updateUser,
  loginRequest,
  signupRequest,
  logoutRequest,
  resetPasswordRequest,
  accountUpdateRequest,
} = authSlice.actions;

const { _authResolution, _authPending } = authSlice.actions;

const authResolutionEpic: Epic = (action$) =>
  action$.pipe(
    filter(_authResolution.match),
    filter((action) => !!action.payload),
    map((action) => addNotification(action.payload!))
  );

function triggerSimpleAuthNotifications(
  errorMessagePrefix: string,
  successMessage?: string
): OperatorFunction<unknown, PayloadAction<NotificationData | undefined>> {
  return (
    source$: Observable<unknown>
  ): Observable<PayloadAction<NotificationData | undefined>> => {
    return source$.pipe(
      map(() =>
        _authResolution(
          successMessage
            ? { message: successMessage, variant: "success" }
            : undefined
        )
      ),
      startWith(_authPending()),
      catchError((e: FirebaseError) => {
        console.error(e);
        return of(
          _authResolution({
            message: [errorMessagePrefix, `Error: ${e.code}`],
            variant: "danger",
          })
        );
      })
    );
  };
}

const loginRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(loginRequest.match),
    switchMap(({ payload: { email, password } }) =>
      from(signInWithEmailAndPassword(auth, email, password)).pipe(
        triggerSimpleAuthNotifications("Login failed")
      )
    )
  );

const signupRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(signupRequest.match),
    switchMap(({ payload: { email, password } }) =>
      from(createUserWithEmailAndPassword(auth, email, password)).pipe(
        triggerSimpleAuthNotifications("Sign up failed")
      )
    )
  );

const logoutRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(logoutRequest.match),
    switchMap(() =>
      from(signOut(auth)).pipe(
        triggerSimpleAuthNotifications("Logout failed", "Logged out")
      )
    )
  );

const resetPasswordRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(resetPasswordRequest.match),
    switchMap((action) =>
      from(sendPasswordResetEmail(auth, action.payload)).pipe(
        triggerSimpleAuthNotifications(
          "Reset password failed",
          "Check your inbox to reset your password"
        )
      )
    )
  );

const accountUpdateRequestEpic: Epic = (action$, state$) =>
  action$.pipe(
    filter(accountUpdateRequest.match),
    withLatestFrom(state$.pipe(map((state) => state.auth.currentUser))),
    switchMap(
      ([
        {
          payload: { email, password },
        },
        currentUser,
      ]) => {
        if (currentUser === null) {
          return of(
            _authResolution({
              message: "Cannot update account because user is logged out",
              variant: "danger",
            })
          );
        }

        const promises: Array<Promise<void>> = [];
        if (email && email !== currentUser.email) {
          promises.push(updateEmail(currentUser, email));
        }
        if (password) {
          promises.push(updatePassword(currentUser, password));
        }
        return promises.length > 0
          ? forkJoin(promises).pipe(
              map(() =>
                _authResolution({
                  message: "Account successfully updated",
                  variant: "success",
                })
              ),
              catchError((e: FirebaseError) => {
                console.error(e);
                return of(
                  _authResolution({
                    message: ["Account update failed", `Error: ${e.code}`],
                    variant: "danger",
                  })
                );
              })
            )
          : of(
              _authResolution({
                message: ["Account not updated", "No new values provided"],
                variant: "info",
              })
            );
      }
    )
  );

export const authEpic = combineEpics(
  authResolutionEpic,
  loginRequestEpic,
  signupRequestEpic,
  logoutRequestEpic,
  resetPasswordRequestEpic,
  accountUpdateRequestEpic
);

export function initializeAuth(
  dispatch: Dispatch<PayloadAction<User | null>>
): Unsubscribe {
  return auth.onAuthStateChanged((user) => {
    dispatch(updateUser(user));
  });
}
