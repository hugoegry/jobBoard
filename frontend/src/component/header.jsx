import React from "react";
import { Helmet } from "react-helmet";
import logo from "../asset/1000009342-removebg-preview.png"; // ton logo dans src/assets

function Header() {
  return (
    <>
      <Helmet>
        <title>Work Sphere</title>
        <link rel="icon" type="image/png" href={logo} />
        <meta property="og:image" content={logo} />
      </Helmet>

      <div className="Wk-header slide-in-top">
        <img src={logo} alt="Logo Work Sphere" className="Wk-logo" />

        <div className="MenuContainer">
          <div className="BurgerIcon">&#9776;</div>
          <ul className="BurgerMenu">
            <li>
              <a href="#">Se connecter</a>
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
