import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/admin/Sidebar.jsx";
import ModulePanel from "../component/admin/ModulePanel.jsx";
import "../styles/style_admin.css"; // adapte le chemin si ton css est ailleurs

const MODULES = ["offer", "user", "company", "application", "companyMember", "document"];

export default function FrmAdmin() {
  const [active, setActive] = useState("offer");
  const userDataStr = sessionStorage.getItem("userobj");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  const [notification, setNotification] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || userData.role !== "admin") {
      setNotification({
        message: "Vous n'avez pas les droits administrateurs ⚠️",
        actionText: "Retour à l'accueil",
      });
      setCountdown(5); // 5 secondes avant redirection
    }
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          navigate("/"); // redirection vers l'accueil
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [countdown, navigate]);


  return (
    <>
      {notification && (
        <div className="NotificationOverlay">
          <div className="NotificationBox">
            <h2>{notification.message}</h2>
            <button onClick={() => navigate("/")}>{notification.actionText}</button>
            <p className="AutoRedirectText">
              Redirection automatique dans {countdown?.toFixed(1)} secondes...
            </p>
            <div className="CountdownBar">
              <div
                className="CountdownProgress"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="app" style={{ minHeight: "calc(100vh - 160px)", pointerEvents: notification ? "none" : "auto" }}>
        <div className="sidebar">
          <div className="logo">Admin</div>
          <Sidebar modules={MODULES} active={active} onChange={setActive} />
        </div>

        <div className="main">
          <ModulePanel moduleName={active} />
        </div>
      </div>
    </>
  );
}