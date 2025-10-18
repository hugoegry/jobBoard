import { useState, useEffect } from "react";
import "../styles/style_vueEmployeur.css";

export default function VueEmployeur() {
  const [showApplications, setShowApplications] = useState(false);

  useEffect(() => {
    fetch(
      `http://localhost/api/application/search?p:id_user=${sessionStorage.getItem(
        "UserId"
      )}`
    )
      .then((res) => {
        if (!res.ok)
          throw new Error("Erreur lors de la récupération des données");
        return res.json();
      })
      .then((data) => setApplications(data))
      .catch((err) => console.error(err));
  }, []);

  const offer = {
    title: "Développeur Web Junior",
    company: "Entreprise Exemple",
    location: "Paris, France",
    description:
      "Nous recherchons un développeur web junior pour renforcer notre équipe.",
  };

  const applications = [
    {
      id: 1,
      name: "Alice Dupont",
      email: "alice@example.com",
      cv: "CV_Alice.pdf",
    },
    {
      id: 2,
      name: "Jean Martin",
      email: "jean@example.com",
      cv: "CV_Jean.pdf",
    },
    {
      id: 3,
      name: "Marie Durand",
      email: "marie@example.com",
      cv: "CV_Marie.pdf",
    },
  ];

  const handleAccept = (id) => alert(`Candidature ${id} acceptée ✅`);
  const handleReject = (id) => alert(`Candidature ${id} refusée ❌`);

  return (
    <div className="vue-offer-container">
      <div className="vue-offer-card">
        <h2 className="vue-offer-title">{offer.title}</h2>
        <p className="vue-offer-company">{offer.company}</p>
        <p className="vue-offer-location">{offer.location}</p>
        <p className="vue-offer-description">{offer.description}</p>
        <button
          className="vue-toggle-btn"
          onClick={() => setShowApplications(!showApplications)}
        >
          {showApplications
            ? "Masquer les candidatures"
            : "Voir les candidatures"}
        </button>
      </div>

      {showApplications && (
        <div className="vue-applications-list">
          <h3 className="vue-applications-title">Candidatures reçues</h3>
          {applications.map((app) => (
            <div key={app.id} className="vue-application-card">
              <div className="vue-application-info">
                <strong className="vue-applicant-name">{app.name}</strong>
                <p className="vue-applicant-email">{app.email}</p>
                <a
                  href={`/${app.cv}`}
                  target="_blank"
                  rel="noreferrer"
                  className="vue-applicant-cv"
                >
                  Voir le CV
                </a>
              </div>
              <div className="vue-application-actions">
                <button
                  className="vue-accept-btn"
                  onClick={() => handleAccept(app.id)}
                >
                  Accepter
                </button>
                <button
                  className="vue-reject-btn"
                  onClick={() => handleReject(app.id)}
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
