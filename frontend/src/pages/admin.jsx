import React, { useState } from "react";
import Sidebar from "../component/admin/Sidebar.jsx";
import ModulePanel from "../component/admin/ModulePanel.jsx";
import "../styles/style_admin.css"; // adapte le chemin si ton css est ailleurs

const MODULES = ["offer", "user", "company", "application", "companyMember", "document"];

export default function FrmAdmin() {
  const [active, setActive] = useState("offer");

  return (
    <div className="app" style={{ minHeight: "calc(100vh - 160px)" }}>
      <div className="sidebar">
        <div className="logo">Admin</div>
        <Sidebar modules={MODULES} active={active} onChange={setActive} />
      </div>

      <div className="main">
        <ModulePanel moduleName={active} />
      </div>
    </div>
  );
}
