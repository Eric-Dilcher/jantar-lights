import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styles from "./App.module.css";
import { Dashboard } from "../Dashboard";
import { UpdateProfile } from "../UpdateProfile";
import { Signup } from "../Signup";
import { Login } from "../Login";
import { ForgotPassword } from "../ForgotPassword";
import { RequireAuth } from "../../atoms/RequireAuth";
import { Notifications } from "../Notifications";
import { ConfigureLights } from "../ConfigureLights/ConfigureLights";
import { initializeAuth } from "../../atoms/auth";
import { store } from "../../atoms/store";

function App() {
  useEffect(() => {
    return initializeAuth(store.dispatch);
  }, []);

  return (
    <Container className="d-flex align-items-center justify-content-center">
      <div className={"my-3 " + styles.app}>
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            ></Route>
            <Route
              path="/update-profile"
              element={
                <RequireAuth>
                  <UpdateProfile />
                </RequireAuth>
              }
            ></Route>
            <Route
              path="/configure-lights"
              element={
                <RequireAuth>
                  <ConfigureLights />
                </RequireAuth>
              }
            ></Route>
          </Routes>
        </Router>
      </div>

      <Notifications />
    </Container>
  );
}

export default App;
