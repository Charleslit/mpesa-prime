import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/send")({
  component: SendLayout,
});

function SendLayout() {
  return <Outlet />;
}
