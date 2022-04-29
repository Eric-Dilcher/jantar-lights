import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  User,
  UserCredential,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
} from "firebase/auth";
import { useContext, useState, useEffect, createContext, ReactNode } from "react";
import { auth } from "../firebase";

export interface IAuthContext {
  /** Value is null if user is not logged in */
  currentUser: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<IAuthContext>(
  // @ts-ignore We always provide a value, so the default is not important
  undefined
);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: {children: ReactNode}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function signup(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout(): Promise<void> {
    return auth.signOut();
  }

  function resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  }

  function updateEmail(email: string): Promise<void> {
    if (!currentUser) return Promise.reject("User not logged in.");
    return firebaseUpdateEmail(currentUser, email);
  }

  function updatePassword(password: string): Promise<void> {
    if (!currentUser) return Promise.reject("User not logged in.");
    return firebaseUpdatePassword(currentUser, password);
  }

  useEffect(() => auth.onAuthStateChanged(setCurrentUser), []);

  const value: IAuthContext = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
