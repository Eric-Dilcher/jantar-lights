import { FormEvent, useRef } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { accountUpdateRequest, AuthStatus } from "../atoms/auth";
import { useAppDispatch, useAppSelector } from "../atoms/hooks";
import { addNotification } from "../atoms/notificationsList";

export function UpdateProfile() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const { currentUser, status } = useAppSelector((state) => state.auth);
  const appDispatch = useAppDispatch();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!currentUser) {
      appDispatch(
        addNotification({ message: "User not lgged in", variant: "danger" })
      );
      navigate("/login");
      return;
    }

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email && !password) {
      appDispatch(
        addNotification({ message: "Email and password is empty", variant: "danger" })
      );
      return;
    }
    if (password !== passwordConfirmRef.current?.value) {
      appDispatch(
        addNotification({
          message: "Passwords do not match",
          variant: "danger",
        })
      );
      return;
    }

    appDispatch(accountUpdateRequest({ email, password }));
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                required
                defaultValue={currentUser?.email ?? undefined}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                ref={passwordRef}
                placeholder="Leave blank to keep the same"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control
                type="password"
                ref={passwordConfirmRef}
                placeholder="Leave blank to keep the same"
              />
            </Form.Group>
            <Button
              disabled={status === AuthStatus.Pending}
              className="w-100"
              type="submit"
            >
              Update
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Cancel</Link>
      </div>
    </>
  );
}
