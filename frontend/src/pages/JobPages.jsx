import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import photoEntrepriseDefault from "../asset/pointDinterrogation.png";

function JobPages() {
  const location = useLocation();
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

    // Construction de l’URL finale
    const LienFetch =
      params.length > 0 ? `${baseURL}?${params.join("&")}` : baseURL;

    fetch(LienFetch)
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
                src={
                  job.company_logo
                    ? `/asset/${job.company_logo}`
                    : photoEntrepriseDefault
                }
                alt={`Logo de ${job.company_name}`}
                className="ImgEntreprise"
              />

              <div className="Ws-DivTextJob">
                <h2>{job.title.toUpperCase()}</h2>
                <span>{job.company_name}</span>
                <h4>
                  {job.location} ({job.type})
                </h4>
                <h4>
                  {job.salary.min_salary}€ - {job.salary.max_salary}€
                </h4>
              </div>
            </div>
            <div className="divAfterClick">
              <p className="ACTags">{job.tags}</p>
              <h1 className="AfterClickTitle">Description</h1>
              <p>{job.description}</p>
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
