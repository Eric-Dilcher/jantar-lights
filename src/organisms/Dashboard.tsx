import { Card, Button, Alert } from "react-bootstrap";
import { Link, Navigate, useLocation } from "react-router-dom";
import { logoutRequest } from "../atoms/auth";
import { useAppSelector, useAppDispatch } from "../atoms/hooks";

export function Dashboard() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const location = useLocation();
  const appDispatch = useAppDispatch();

  function handleLogout() {
    appDispatch(logoutRequest());
  }

  if (currentUser === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Profile</h2>
          <strong>Email:</strong> {currentUser.email}
          <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
            Update Profile
          </Link>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </>
  );
}
