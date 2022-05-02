import assertNever from "assert-never";
import { Toast, ToastContainer } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "../atoms/hooks";
import {
  NotificationData,
  removeNotification,
} from "../atoms/notificationsList";

export function Notifications() {
  const appDispatch = useAppDispatch();
  const notifications = useAppSelector(
    (store) => store.notificationsList.notifications
  );

  function generateHeader(variant: NotificationData["variant"]): string {
    switch (variant) {
      case "success":
        return "Success";
      case "danger":
        return "Error";
      case "warning":
        return "Warning";
      case "info":
        return "Info";
      default:
        assertNever(variant);
    }
  }

  function onCloseClicked(id: string): void {
    appDispatch(removeNotification(id));
  }

  return (
    <ToastContainer position="top-end" className="p-3">
      {notifications.map((n) => {
        return (
          <Toast bg={n.variant} onClose={() => onCloseClicked(n.id)}>
            <Toast.Header><strong className="me-auto">{generateHeader(n.variant)}</strong></Toast.Header>
            <Toast.Body>{n.message}</Toast.Body>
          </Toast>
        );
      })}
    </ToastContainer>
  );
}
