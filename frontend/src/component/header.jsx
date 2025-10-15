import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import logo from "../asset/1000009342-removebg-preview.png";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const ReturnAccueil = () => navigate("/");

  const navigateToConnexion = () => navigate("/connexion");

  const navigateToMyAccount = () => navigate("/MyAccount");
  const navigateToAdmin = () => navigate("/admin");

  const handleLogout = () => {
    sessionStorage.removeItem("isConnected");
    sessionStorage.removeItem("userEmail");
    setIsLoggedIn(false);

    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  useEffect(() => {
    const connected = sessionStorage.getItem("isConnected") === "true";
    setIsLoggedIn(connected);

    const handleStorageChange = () => {
      const connected = sessionStorage.getItem("isConnected") === "true";
      setIsLoggedIn(connected);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Work Sphere</title>
        <link rel="icon" type="image/png" href={logo} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
        <meta property="og:image" content={logo} />
      </Helmet>

      <div className="Wk-header slide-in-top">
        <img
          src={logo}
          alt="Logo Work Sphere"
          className="Wk-logo slide-in-tl"
          onClick={ReturnAccueil}
        />

        <div className="MenuContainer slide-in-tl">
          <div className="BurgerIcon">&#9776;</div>
          <ul className="BurgerMenu">
            {!isLoggedIn ? (
              <>
                <li><a onClick={navigateToConnexion}>Se connecter</a></li>
              </>
            ) : (
              <>
                <li><a href="#" onClick={navigateToMyAccount}>Mon compte</a></li>
                <li><a href="#" onClick={handleLogout}>Se déconnecter</a></li>
                <li><a onClick={navigateToAdmin}>Admin</a></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
