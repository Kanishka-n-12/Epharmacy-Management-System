import { Outlet } from "react-router-dom";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

export default function UserLayout() {
  return (
    <>
      <Header />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <ScrollToTop/>
      <Footer />
    </>
  );
}