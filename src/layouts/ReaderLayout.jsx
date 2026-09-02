import { Outlet } from "react-router";
export default function ReaderLayout() {
  return (
    <div className="bg-paper min-h-screen">
      <Outlet />
    </div>
  );
}
