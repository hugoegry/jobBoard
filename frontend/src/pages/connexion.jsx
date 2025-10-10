import { useState } from "react";

function FormConnexion() {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
  };
  useEffect(() => {
    fetch("http://localhost/api/user/testreou")
      .then((res) => res.json())
      .then((data) => {
        setNbAnnonce(data.number);
      })
      .catch((err) => console.error("Erreur :", err));
  }, []);

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
              <input type="email" name="email" placeholder="Email" />
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
              />
              <div className="containerRememberMe">
                <input type="checkbox" id="rememberMe" name="rememberMe" />
                <span>Se souvenir de moi</span>
              </div>
              <a href="#" className="SKH-MDP-OUBLI">
                Mot de passe oublié ?
              </a>
              <button type="button" className="buttonStartAuth">
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
