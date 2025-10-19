import React, { useEffect, useState } from "react";
import "../styles/style_vueApplication.css";

export default function Applications() {
  const [applications, setApplications] = useState([]);

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

  return (
    <div className="applications-container">
      <h1>Mes Candidatures</h1>
      {applications.length === 0 ? (
        <p className="empty-text">Vous n'avez encore postulé à aucune offre.</p>
      ) : (
        <div className="applications-list">
          {applications.map((app, index) => (
            <div className="application-card" key={index}>
              <div className="application-header">
                <img
                  src={`http://localhost/asset/${app.company_logo}`}
                  alt={app.company_name}
                  className="company-logo"
                />
                <div>
                  <h2>{app.title}</h2>
                  <span className="company-name">{app.company_name}</span>
                </div>
                <span
                  className={`status ${app.status ? app.status : "En-Attente"}`}
                >
                  {app.status || "En-Attente"}
                </span>
              </div>

              <div className="application-body">
                <p>
                  <strong>Type :</strong> {app.type}
                </p>
                <p>
                  <strong>Lieu :</strong> {app.location}
                </p>
                <p>
                  <strong>Message :</strong> {app.message}
                </p>
                <p>
                  <strong>Date de candidature :</strong>{" "}
                  {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
