import { FormEvent, useRef } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AuthStatus, resetPasswordRequest } from "../atoms/auth";
import { useAppDispatch, useAppSelector } from "../atoms/hooks";

export function ForgotPassword() {
  const emailRef = useRef<HTMLInputElement>(null);
  const appDispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const email = emailRef.current?.value;
    if (!email) {
      return;
    }
    appDispatch(resetPasswordRequest(email));
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Password Reset</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Button
              disabled={status === AuthStatus.Pending}
              className="w-100"
              type="submit"
            >
              Reset Password
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/login">Login</Link>
          </div>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </>
  );
}
