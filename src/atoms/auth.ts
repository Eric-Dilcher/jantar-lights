import { from, of, forkJoin } from "rxjs";
import {
  filter,
  switchMap,
  map,
  catchError,
  withLatestFrom,
} from "rxjs/operators";
import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  User,
  signOut,
  updateEmail,
  updatePassword,
  Unsubscribe,
} from "firebase/auth";
import { combineEpics, Epic } from "redux-observable";
import { Dispatch } from "react";
import { addNotification, NotificationData } from "./notificationsList";

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
    _updateUser(state, action: PayloadAction<User | null>): void {
      state.currentUser = action.payload;
    },
    _authResolution(
      state,
      _action: PayloadAction<NotificationData | undefined>
    ): void {
      state.status = AuthStatus.Ready;
    },
    loginRequest(
      state,
      _action: PayloadAction<{ email: string; password: string }>
    ): void {
      state.status = AuthStatus.Pending;
    },
    signupRequest(
      state,
      _action: PayloadAction<{ email: string; password: string }>
    ): void {
      state.status = AuthStatus.Pending;
    },
    logoutRequest(state): void {
      state.status = AuthStatus.Pending;
    },
    resetPasswordRequest(state, _action: PayloadAction<string>): void {
      state.status = AuthStatus.Pending;
    },
    accountUpdateRequest(
      state,
      _action: PayloadAction<{ email?: string; password?: string }>
    ): void {
      state.status = AuthStatus.Pending;
    },
  },
});

export const {
  loginRequest,
  signupRequest,
  logoutRequest,
  resetPasswordRequest,
  accountUpdateRequest,
} = authSlice.actions;

const { _updateUser, _authResolution } = authSlice.actions;

const authResolutionEpic: Epic = (action$) =>
  action$.pipe(
    filter(_authResolution.match),
    filter((action) => !!action.payload),
    map((action) => addNotification(action.payload!))
  );

const loginRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(loginRequest.match),
    switchMap(({ payload: { email, password } }) =>
      from(signInWithEmailAndPassword(auth, email, password)).pipe(
        map(() => _authResolution()),
        catchError(() =>
          of(_authResolution({ message: "Login failed", variant: "danger" }))
        )
      )
    )
  );

const signupRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(signupRequest.match),
    switchMap(({ payload: { email, password } }) =>
      from(createUserWithEmailAndPassword(auth, email, password)).pipe(
        map(() => _authResolution()),
        catchError(() =>
          of(_authResolution({ message: "Sign up failed", variant: "danger" }))
        )
      )
    )
  );

const logoutRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(logoutRequest.match),
    switchMap(() =>
      from(signOut(auth)).pipe(
        map(() =>
          _authResolution({ message: "Logged out", variant: "success" })
        ),
        catchError(() =>
          of(_authResolution({ message: "Logout failed", variant: "danger" }))
        )
      )
    )
  );

const resetPasswordRequestEpic: Epic = (action$) =>
  action$.pipe(
    filter(resetPasswordRequest.match),
    switchMap((action) =>
      from(sendPasswordResetEmail(auth, action.payload)).pipe(
        map(() =>
          _authResolution({
            message: "Check your inbox to reset your password",
            variant: "success",
          })
        ),
        catchError(() =>
          of(
            _authResolution({
              message: "Reset password failed",
              variant: "danger",
            })
          )
        )
      )
    )
  );

const accountUpdateRequestEpic: Epic<Action, Action, { auth: AuthState }> = (
  action$,
  state$
) =>
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
              catchError(() =>
                of(
                  _authResolution({
                    message: "Account update failed.",
                    variant: "danger",
                  })
                )
              )
            )
          : of(
              _authResolution({
                message: "Account not updated. No new values provided.",
                variant: "danger",
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
    dispatch(_updateUser(user));
  });
}
