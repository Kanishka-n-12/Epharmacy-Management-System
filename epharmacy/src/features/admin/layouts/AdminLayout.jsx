

import { useState } from "react";
import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";
import ScrollToTop from "../../../components/layout/components/ScrollToTop";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
     
      <SideNavbar open={sidebarOpen} onClose={closeSidebar} />

      
      <div
        className={`sidebar-backdrop${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
      />

      <div className="admin-main">
        <Header onHamburger={openSidebar} />
        <main className="admin-content">
          {children}
        </main>
        <ScrollToTop/>

       
        <footer className="admin-footer">
          <span>
            © 2026 <strong>EPHARMACY</strong>. All rights reserved.
          </span>
        </footer>
      </div>
    </div>
  );
}