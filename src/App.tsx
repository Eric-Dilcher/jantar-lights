import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./organisms/Dashboard";
import { UpdateProfile } from "./organisms/UpdateProfile";
import { Signup } from "./organisms/Signup";
import { Login } from "./organisms/Login";
import { ForgotPassword } from "./organisms/ForgotPassword";
import { RequireAuth } from "./atoms/RequireAuth";
import { Notifications } from "./organisms/Notifications";
import { ConfigureLights } from "./organisms/ConfigureLights/ConfigureLights";
import { initializeAuth } from "./atoms/auth";
import { store } from "./atoms/store";

function App() {
  useEffect(() => {
    return initializeAuth(store.dispatch);
  }, []);

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Router>
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }></Route>
              <Route path="/update-profile" element={
                <RequireAuth>
                  <UpdateProfile />
                </RequireAuth>
              }></Route>
              <Route path="/configure-lights" element={
                <RequireAuth>
                  <ConfigureLights />
                </RequireAuth>
              }></Route>
            </Routes>
        </Router>
      </div>

      <Notifications/>
    </Container>
  );
}

export default App;
