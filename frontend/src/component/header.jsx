import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import logo from "../asset/1000009342-removebg-preview.png";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRecruter, setIsRecruter] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyMember, setCompanyMember] = useState([]);

  const ReturnAccueil = () => navigate("/");

  const navigateToConnexion = () => navigate("/connexion");

  const navigateToMyAccount = () => navigate("/MyAccount");
  const navigateToAdmin = () => navigate("/admin");

  const handleLogout = async () => {
    sessionStorage.removeItem("userobj");
    sessionStorage.removeItem("isConnected");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userobj");
    sessionStorage.removeItem("UserId");
    sessionStorage.removeItem("userFirstName");
    sessionStorage.removeItem("userLastName");
    sessionStorage.removeItem("userPhone");
    setIsLoggedIn(false);
    setIsRecruter(false);

    try {
      const response = await fetch("http://localhost/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.json();

      if (response.ok) {
        console.log(data.message);
      } else {
        console.error("Erreur lors de la déconnexion :", data.error);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }

    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };
  const navigateToApply = () => navigate("/vueApply");
  const navigateToVueEmployeur = () => navigate("/vueEmployeur");

  useEffect(() => {
    const connected = sessionStorage.getItem("isConnected") === "true";
    setIsLoggedIn(connected);

    const handleStorageChange = () => {
      const userDataStr = sessionStorage.getItem("userobj");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const connected = sessionStorage.getItem("isConnected") === "true";
      let isRecruiter = false;
      if (userData && userData.societys) {
        userData.societys.forEach((society) => {
          if (society.role === "Recruiter") isRecruiter = true;
        });
      }

      setIsAdmin(userData && userData.role === "admin");
      setIsRecruter(isRecruiter);
      setIsLoggedIn(connected);
    };

    handleStorageChange();

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
                <li>
                  <a onClick={navigateToConnexion}>Se connecter</a>
                </li>
              </>
            ) : (
              <>
                <li><a href="#" onClick={navigateToMyAccount}>Mon compte</a></li>
                {isRecruter && (
                  <li><Link to="/vueEmployeur">Candidature offre</Link></li>
                )}
                <li><Link to="/vueApply">Mes Candidatures</Link></li>

                {isAdmin && (
                  <li><Link to="/admin">Admin</Link></li>
                )}
                <li><a onClick={handleLogout}>Se déconnecter</a></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
