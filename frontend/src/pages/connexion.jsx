import { useState } from "react";
import { useNavigate } from "react-router-dom";

function FormConnexion() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConnected, setIsConnected] = useState(
    sessionStorage.getItem("isConnected") === "true"
  );

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
  };

  // Fonction pour hacher le mot de passe avec SHA-256
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // ======= CONNEXION =======
  const handleLogin = async () => {
    const email = document.getElementById("email-login").value;
    const password = document.getElementById("mdp-login").value;
    const rememberMe = document.getElementById("rememberMe-login").checked;

    if (!email || !password) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    let hashedPassword = await hashPassword(password);
    try {
      // Construction de la query string
      const query = new URLSearchParams({
        email: email,
        password: hashedPassword, // mot de passe en clair
        remember_me: rememberMe,
      }).toString();

      const response = await fetch(`http://localhost/api/auth?${query}`, {
        method: "GET",
      });

      const data = await response.json();
      console.log("Réponse backend :", data);

      if (data.success || data.id) {
        sessionStorage.setItem("userobj", JSON.stringify(data));
        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("isConnected", "true");
        sessionStorage.setItem("userFirstName", data.first_name);
        sessionStorage.setItem("userLastName", data.last_name);
        sessionStorage.setItem("UserId", data.id);
        sessionStorage.setItem("userPhone", data.phone);
        window.dispatchEvent(new Event("storage"));
        setIsConnected(true);
        navigate("/");
      } else {
        alert(data.error || "Identifiants invalides !");
      }
    } catch (err) {
      console.error("Erreur fetch :", err);
      alert("Erreur lors de la connexion.");
    }
  };

  // ======= INSCRIPTION =======
  const handleSignup = async () => {
    const lastName = document.getElementById("lastname-signup").value.trim();
    const firstName = document.getElementById("firstname-signup").value.trim();
    const email = document.getElementById("email-signup").value.trim();
    const phone = document.getElementById("phoneNumber-signup").value.trim();
    const password = document.getElementById("password-signup").value;
    const confPassword = document.getElementById("confpassword-signup").value;

    if (!lastName || !firstName || !email || !password || !confPassword) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    if (password !== confPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    const hashedPassword = await hashPassword(password);

    try {
      const response = await fetch("http://localhost/api/auth/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "p:email": email,
          "p:password": hashedPassword,
          "p:last_name": lastName,
          "p:first_name": firstName,
          "p:phone": phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        document.getElementById("lastname-signup").value = "";
        document.getElementById("firstname-signup").value = "";
        document.getElementById("email-signup").value = "";
        document.getElementById("phoneNumber-signup").value = "";
        document.getElementById("password-signup").value = "";
        document.getElementById("confpassword-signup").value = "";
        setIsSignUp(false);
        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("isConnected", "true");
        sessionStorage.setItem("userFirstName", data.first_name);
        sessionStorage.setItem("userLastName", data.last_name);
        sessionStorage.setItem("UserId", data.id);
        sessionStorage.setItem("userPhone", phone);
        window.dispatchEvent(new Event("storage"));
        setIsConnected(true);
        navigate("/");
      } else if (response.status === 409) {
        alert("Un compte avec cet email existe déjà !");
      } else {
        alert(data.error || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      console.error("Erreur :", err);
      alert("Erreur serveur lors de l'inscription.");
    }
  };

  return (
    <div className="containerPageConnexion">
      <div
        className={`containerConnexion ${isSignUp ? "active" : ""}`}
        id="container"
      >
        {/* ------- INSCRIPTION ------- */}
        <div className="form-container sign-up">
          <form method="POST" action="">
            <div id="containerLogin" className="containerContentForm active">
              <h1>Créer un compte</h1>
              <span>ou utilisez votre email pour l'inscription</span>
              <input
                type="text"
                id="lastname-signup"
                name="lastname"
                placeholder="Nom"
              />
              <input
                type="text"
                id="firstname-signup"
                name="firstname"
                placeholder="Prénom"
              />
              <input
                type="email"
                id="email-signup"
                name="email"
                placeholder="Email"
              />
              <input
                type="text"
                id="phoneNumber-signup"
                name="phoneNumber"
                placeholder="Numéro de téléphone"
              />
              <input
                type="password"
                id="password-signup"
                name="password"
                placeholder="Mot de passe"
              />
              <input
                type="password"
                id="confpassword-signup"
                name="confpassword"
                placeholder="Confirmez le mot de passe"
              />
              <div className="containerRememberMe">
                <input
                  type="checkbox"
                  id="rememberMe-signup"
                  name="rememberMe"
                />
                <span>Se souvenir de moi</span>
              </div>
              <button
                type="button"
                className="buttonStartAuth"
                onClick={handleSignup}
              >
                Inscription
              </button>
            </div>
          </form>
        </div>

        {/* ------- CONNEXION ------- */}
        <div className="form-container sign-in">
          <form method="POST" action="">
            <div id="containerSignIn" className="containerContentForm active">
              <h1>Connexion</h1>
              <span id="SKH-conexion-texte-left-web">
                ou utilisez votre mot de passe et votre email
              </span>
              <input
                id="email-login"
                type="email"
                name="email"
                placeholder="Email"
              />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                id="mdp-login"
              />
              <div className="containerRememberMe">
                <input
                  type="checkbox"
                  id="rememberMe-login"
                  name="rememberMe"
                />
                <span>Se souvenir de moi</span>
              </div>
              <a href="#" className="SKH-MDP-OUBLI">
                Mot de passe oublié ?
              </a>
              <button
                type="button"
                className="buttonStartAuth"
                onClick={handleLogin}
              >
                Connexion
              </button>
            </div>
          </form>
        </div>

        {/* ------- TOGGLE ------- */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1 id="normal">Vous êtes de retour ?</h1>
              <h1 id="mobil">De retour ?</h1>
              <p>
                Connectez-vous avec vos identifiants pour accéder pleinement au
                site.
              </p>
              <button className="hidden" id="login" onClick={handleToggle}>
                Se connecter
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Bienvenue!</h1>
              <p>
                Entrez vos coordonnées personnelles pour pouvoir utiliser toutes
                les fonctionnalités du site.
              </p>
              <button className="hidden" id="register" onClick={handleToggle}>
                Inscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormConnexion;
