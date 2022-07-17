import { Link, Outlet } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex h-full w-full flex-col gap-6">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <div className="flex justify-between">
      <div>menu button</div>

      <div>live free</div>

      <div>notifications</div>
    </div>
  );
}

function Sidebar() {
  return <div />;
}
