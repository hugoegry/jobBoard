import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import photoEntrepriseDefault from "../asset/pointDinterrogation.png";

function JobPages() {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    fetch(`http://localhost/api/user/testreou2?p:type=`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la requête");
        return res.json();
      })
      .then((data) => setJobs(data))
      .catch((err) => console.error("Erreur :", err));
  }, []);

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
                <h2>{job.title}</h2>
                <span>{job.company_name}</span>
                <h4>
                  {job.location} ({job.type})
                </h4>
              </div>
            </div>
            <div className="divAfterClick">
              <p>{job.offer_description}</p>
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
