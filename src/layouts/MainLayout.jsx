import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommandPalette from "../components/CommandPalette";

export default function MainLayout() {
  const [pal, setPal] = useState(false);
  useEffect(() => {
    const f = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPal((p) => !p);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onSearch={() => setPal(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette open={pal} onClose={() => setPal(false)} />
    </div>
  );
}
