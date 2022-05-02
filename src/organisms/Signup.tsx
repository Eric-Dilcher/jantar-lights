import { FormEvent, useRef } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link, Navigate, useLocation } from "react-router-dom";
import { AuthStatus, signupRequest } from "../atoms/auth";
import { useAppDispatch, useAppSelector } from "../atoms/hooks";
import { addNotification } from "../atoms/notificationsList";

export function Signup() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const { currentUser, status } = useAppSelector((state) => state.auth);
  const appDispatch = useAppDispatch();
  const location = useLocation();

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const passwordConfirm = passwordConfirmRef.current?.value;

    if (password !== passwordConfirm) {
      appDispatch(
        addNotification({
          message: "Passwords do not match",
          variant: "danger",
        })
      );
      return;
    }

    if (!password || !passwordConfirm) {
      appDispatch(
        addNotification({ message: "Password is empty", variant: "danger" })
      );
      return;
    }

    if (!email) {
      appDispatch(
        addNotification({ message: "Email is empty", variant: "danger" })
      );
      return;
    }
    appDispatch(signupRequest({ email, password }));
  }

  if (currentUser !== null) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Button
              disabled={status === AuthStatus.Pending}
              className="w-100"
              type="submit"
            >
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </>
  );
}
