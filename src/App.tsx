import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./organisms/Dashboard";
import { UpdateProfile } from "./organisms/UpdateProfile";
import { Signup } from "./organisms/Signup";
import { Login } from "./organisms/Login";
import { ForgotPassword } from "./organisms/ForgotPassword";
import { RequireAuth } from "./atoms/RequireAuth";
import { Notifications } from "./molecules/Notifications";

function App() {
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
            </Routes>
        </Router>
      </div>

      <Notifications/>
    </Container>
  );
}

export default App;
