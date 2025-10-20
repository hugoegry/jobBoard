import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import photoEntrepriseDefault from "../asset/pointDinterrogation.png";

function JobPages() {
  const navigate = useNavigate();
  const location = useLocation();
  const userDataStr = sessionStorage.getItem("userobj");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  const [jobs, setJobs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const { poste, lieu, contract } = location.state || {};

  useEffect(() => {
    const baseURL = "http://localhost/api/offer/search";
    const params = [];

    if (poste && poste.trim() !== "") {
      params.push(`p:title=${encodeURIComponent(poste)}`);
    }

    if (lieu && lieu.trim() !== "") {
      params.push(`p:location=${encodeURIComponent(lieu)}`);
    }

    if (contract && contract.trim() !== "") {
      params.push(`p:type=${encodeURIComponent(contract)}`);
    }

    // Construction de l URL finale
    const LienFetch =
      params.length > 0 ? `${baseURL}?${params.join("&")}` : baseURL;

    fetch(LienFetch, {
      method: "GET",
      credentials: "include", // Inclure les cookies pour la session
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la requête");
        return res.json();
      })
      .then((data) => setJobs(data))
      .catch((err) => console.error("Erreur :", err));
  }, [poste, lieu, contract]);

  const dropDown = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handlePostuler = (e, job) => {
    e.stopPropagation(); // évite d'ouvrir/fermer le panel en même temps \\
    navigate(`/offre/${encodeURIComponent(job.offers_id)}`, { state: { job } });
  };

  const handleLogin = () => {
    navigate('/connexion');
  };

  return (
    <section className="SectionJob">
      <h1>Liste des jobs</h1>

      {Array.isArray(jobs) && jobs.length > 0 ? (
        jobs.map((job, index) => (
          <div
            key={index}
            className={`divJob ${activeIndex === index ? "open" : ""}`}
            onClick={() => dropDown(index)}
          >
            <div className="ImageText">
              <img
                src={job.company_logo ? `/asset/${job.company_logo}` : photoEntrepriseDefault}
                alt={`Logo de ${job.company_name}`}
                className="ImgEntreprise"
              />

              <div className="Ws-DivTextJob">
                <h2>{job.title}</h2>
                <span>{job.company_name.toUpperCase()}</span>
                <h4>{job.location} ({job.type})</h4>
                <h4>{job.salary.min_salary}€ - {job.salary.max_salary}€</h4>
              </div>
            </div>
            <div className="divAfterClick">
              <p className="ACTags">{job.tags}</p>
              <h1 className="AfterClickTitle">Description</h1>
              <p>{job.company_description}</p>
              <div className="ActionsJob">
                  {userData ? (
                    <button type="button" className="PostulerBtn" onClick={(e) => handlePostuler(e, job)}>Postuler</button>
                  ) : (
                    <button type="button" className="ConnexionBtn" onClick={handleLogin}>Se connecter pour postuler</button>
                  )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Aucune offre disponible.</p>
      )}
    </section>
  );
}

export default JobPages;
