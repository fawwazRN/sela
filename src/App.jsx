import { Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import ReaderLayout from "./layouts/ReaderLayout";

import Home from "./pages/Home";
import Jelajah from "./pages/Jelajah";
import Kurasi from "./pages/Kurasi";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import Search from "./pages/Search";
import Rak from "./pages/Rak";
import Highlights from "./pages/Highlights";
import Stats from "./pages/Stats";
import SettingsPage from "./pages/SettingsPage";
import ImportPage from "./pages/ImportPage";
import StudioList from "./pages/StudioList";
import StudioEditor from "./pages/StudioEditor";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Tutorial from "./pages/Tutorial";
import Glosarium from "./pages/Glosarium";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      {/* Halaman biasa — pakai navbar + footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jelajah" element={<Jelajah />} />
        <Route path="/kurasi/:slug" element={<Kurasi />} />
        <Route path="/buku/:slug" element={<BookDetail />} />
        <Route path="/cari" element={<Search />} />
        <Route path="/saya" element={<Rak />} />
        <Route path="/saya/highlight" element={<Highlights />} />
        <Route path="/saya/statistik" element={<Stats />} />
        <Route path="/saya/pengaturan" element={<SettingsPage />} />
        <Route path="/impor" element={<ImportPage />} />
        <Route path="/studio" element={<StudioList />} />
        <Route path="/studio/:id" element={<StudioEditor />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/glosarium" element={<Glosarium />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Reader — chrome-less, UI menghilang */}
      <Route element={<ReaderLayout />}>
        <Route path="/baca/:slug" element={<Reader />} />
      </Route>
    </Routes>
  );
}
