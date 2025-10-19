import photoAccueil from "../asset/photoAccueil.jpg";
import photoLoupe from "../asset/loupe.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Accueil() {
  const navigate = useNavigate();
  const [contract, setContract] = useState("");
  const [nbAnnonce, setNbAnnonce] = useState(0);
  const [poste, setPoste] = useState("");
  const [lieu, setLieu] = useState("");

  // Récupération du nombre d'annonces au montage
  useEffect(() => {
    fetch("http://localhost/api/offer/count", {
      method: "GET",
      credentials: "include", // Inclure les cookies pour la session
    })
      .then((res) => res.json())
      .then((data) => {
        setNbAnnonce(data.number);
      })
      .catch((err) => console.error("Erreur :", err));
  }, []);
  // offre emploie

  const handleSearch = () => {
    navigate("/jobs", { state: { poste, lieu, contract } });
  };

  return (
    <section className="Ws-Section">
      <div className="Ws-img">
        <img src={photoAccueil} alt="photoAccueil" />
        <span className="spanTextJob">
          Notre job,
          <br />
          vous aider à choisir le vôtre parmi <br />
        </span>
        <span className="spanNbAnnonce">{nbAnnonce}</span>
        <span className="spanAnnonce">Annonce</span>
      </div>

      <div className="Ws-SearchBar">
        <form>
          <div className="contactContainerElement">
            <input
              id="posteInput"
              type="text"
              placeholder=" "
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
            />
            <span>Type de Poste</span>
          </div>

          <div className="contactContainerElement">
            <input
              id="lieuInput"
              type="text"
              placeholder=" "
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
            />
            <span>Lieu</span>
          </div>

          <div className="contactContainerElement">
            <select
              id="SelectContract"
              className="Ws-Select-Contract"
              value={contract}
              onChange={(e) => setContract(e.target.value)}
            >
              <option value="">Type de Contrat</option>
              <option value="alternance">Alternance</option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="mi-temps">Mi-temps</option>
              <option value="freelance">Freelance</option>
              <option value="stage">Stage</option>
              <option value="benevolat">Bénevolat</option>
            </select>
            {contract && <span>Type de Contrat</span>}
          </div>

          <button type="button" className="Ws-Btn-Submit" id="Ws-Btn-Submit" onClick={handleSearch}>Rechercher</button>
        </form>
      </div>

      <div className="Ws-aboutUs"></div>
    </section>
  );
}

export default Accueil;
