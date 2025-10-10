import React from "react";
import { Helmet } from "react-helmet";
import logo from "../asset/1000009342-removebg-preview.png"; // ton logo dans src/assets
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const ReturnAccueil = () => {
    navigate("/");
  };
  const navigateToConnexion = () => {
    navigate("/connexion");
  };

  return (
    <>
      <Helmet>
        <title>Work Sphere</title>
        <link rel="icon" type="image/png" href={logo} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
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
            <li>
              <a onClick={navigateToConnexion}>Se connecter</a>
            </li>
            <li>
              <a href="#">S’inscrire</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Header;
