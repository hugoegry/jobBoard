import { useState } from "react";

function FormConnexion() {
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

  const handleLogin = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("mdp").value;

    if (!email || !password) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const hashedPassword = await hashPassword(password);

    try {
      const response = await fetch(
        `http://localhost/api/user/auth?email=${email}&password=${hashedPassword}&remenber_me=false`
      );
      const data = await response.json();

      if (data.success) {
        // Stocker la session
        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("isConnected", "true");
        setIsConnected(true);
        alert("Connexion réussie !");
      } else {
        alert("Identifiants invalides !");
      }
    } catch (err) {
      console.error("Erreur :", err);
      alert("Erreur lors de la connexion.");
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
              <input type="text" name="lastname" placeholder="Nom" />
              <input type="text" name="firstname" placeholder="Prenom" />
              <input type="email" name="email" placeholder="Email" />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
              />
              <input
                type="password"
                name="confpassword"
                placeholder="Confirme le Mot de passe"
              />
              <div className="containerRememberMe">
                <input type="checkbox" id="rememberMe" name="rememberMe" />
                <span>Se souvenir de moi</span>
              </div>
              <button type="button" className="buttonStartAuth">
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
              <input id="email" type="email" name="email" placeholder="Email" />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                id="mdp"
              />
              <div className="containerRememberMe">
                <input type="checkbox" id="rememberMe" name="rememberMe" />
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
