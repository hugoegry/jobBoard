import photoAccueil from "../asset/photoAccueil.jpg";
import { useState } from "react";

function Accueil() {
  const [contract, setContract] = useState("");

  return (
    <section className="Ws-Section">
      <img src={photoAccueil} alt="photoAccueil" />
      <span>Notre job, vous aider à choisir le vôtre parmi</span>
      <div className="Ws-SearchBar">
        <form>
          <div className="contactContainerElement">
            <input id="posteInput" type="text" placeholder=" " />
            <span>Type de Poste</span>
          </div>

          <div className="contactContainerElement">
            <input id="lieuInput" type="text" placeholder=" " />
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
              <option value="Alternance">Alternance</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
            </select>
            {/* n'affiche le span que si une option est sélectionnée */}
            {contract && <span>Type de Contrat</span>}
          </div>
        </form>
      </div>
      <div className="Ws-aboutUs"></div>
    </section>
  );
}

export default Accueil;
