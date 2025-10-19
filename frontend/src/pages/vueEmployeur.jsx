import { useState, useEffect } from "react";
import "../styles/style_vueEmployeur.css";

export default function VueEmployeur() {
  const [offers, setOffers] = useState([]);
  const [expandedOffers, setExpandedOffers] = useState({}); // { offerId: true/false }
  const [applications, setApplications] = useState({}); // { offerId: [...applications] }
  const [loadingApps, setLoadingApps] = useState({}); // { offerId: boolean }
  const [errorApps, setErrorApps] = useState({}); // { offerId: string }
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);

  // 🔹 Fetch des offres
  useEffect(() => {
    const companyId = sessionStorage.getItem("C.id");
    if (!companyId) {
      setErrorOffers("Aucune entreprise associée à cet utilisateur.");
      setLoadingOffers(false);
      return;
    }

    fetch(`http://localhost/api/offer/search?p:company_id=${companyId}`,{
      method: "GET",
      credentials: "include", // Inclure les cookies pour la session
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("Erreur lors de la récupération des offres");
        return res.json();
      })
      .then((data) => setOffers(data))
      .catch((err) => setErrorOffers(err.message))
      .finally(() => setLoadingOffers(false));
  }, []);

  // 🔹 Toggle pour voir les candidatures
  const toggleApplications = async (offerId) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }));

    // Si jamais pas encore chargé, fetch les candidatures
    if (!applications[offerId]) {
      setLoadingApps((prev) => ({ ...prev, [offerId]: true }));

      try {
        const res = await fetch(`http://localhost/api/application/search?p:offers_id=${offerId}&p:status=En-Attente`, {
          method: "GET",
          credentials: "include", // Inclure les cookies pour la session
        });
        const data = res.ok ? await res.json() : [];
        setApplications((prev) => ({ ...prev, [offerId]: data }));
        setErrorApps((prev) => ({ ...prev, [offerId]: null }));
      } catch (err) {
        console.error(err);
        setApplications((prev) => ({ ...prev, [offerId]: [] }));
        setErrorApps((prev) => ({ ...prev, [offerId]: err.message }));
      } finally {
        setLoadingApps((prev) => ({ ...prev, [offerId]: false }));
      }
    }
  };

  // 🔹 Met à jour le statut d'une candidature
  const updateApplicationStatus = async (idOffer, idUser, status) => {
    console.log("arazeraezrazerzaerazer", idOffer);
    console.log("aqsqsdfqsdfqsfdqsfqsfsqf", offers);
    const body = {
      "p:offers_id": idOffer,
      "p:users_id": idUser,
      "f:status": status,
    };

    try {
      const response = await fetch("http://localhost/api/application/", {
        method: "PUT",
        credentials: "include", // Inclure les cookies pour la session
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const data = await response.json();
      console.log("Réponse serveur :", data);

      // Mise à jour locale pour refléter le changement immédiatement
      setApplications((prev) => {
        const updatedApps = prev[idOffer].map((app) =>
          app.users_id === idUser ? { ...app, status } : app
        );
        return { ...prev, [idOffer]: updatedApps };
      });
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour la candidature.");
    }
  };

  const handleAccept = (idOffer, idUser) =>
    updateApplicationStatus(idOffer, idUser, "Acceptée");
  const handleReject = (idOffer, idUser) =>
    updateApplicationStatus(idOffer, idUser, "Refusée");

  if (loadingOffers) return <p>Chargement des offres...</p>;
  if (errorOffers) return <p style={{ color: "red" }}>{errorOffers}</p>;

  const ApplicationCard = ({ app, offerId }) => (
    <div
      className={`vue-application-card ${
        app.status === "Acceptée"
          ? "accepted"
          : app.status === "Refusée"
          ? "rejected"
          : ""
      }`}
    >
      <div className="vue-application-info">
        <p>Message: {app.message}</p>
        <p>Email: {app.candidate_email}</p>
        <p>Téléphone: {app.candidate_phone}</p>
        {app.status && <p>Status: {app.status}</p>}
      </div>
      <div className="vue-application-actions">
        <button
          className="vue-accept-btn"
          onClick={() => handleAccept(offerId, app.users_id)}
          disabled={app.status === "Acceptée" || app.status === "Refusée"}
        >
          {app.status === "Acceptée" ? "Acceptée ✅" : "Accepter"}
        </button>
        <button
          className="vue-reject-btn"
          onClick={() => handleReject(offerId, app.users_id)}
          disabled={app.status === "Acceptée" || app.status === "Refusée"}
        >
          {app.status === "Refusée" ? "Refusée ❌" : "Refuser"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="vue-offer-container">
      {offers.length === 0 ? (
        <p>Aucune offre disponible pour cette entreprise.</p>
      ) : (
        offers.map((offer, index) => (
          <div
            key={offer.offers_id || `offer-${index}`}
            className="vue-offer-card"
          >
            <h2 className="vue-offer-title">{offer.title}</h2>
            <p className="vue-offer-company">{offer.company}</p>
            <p className="vue-offer-location">{offer.location}</p>
            <p className="vue-offer-description">{offer.company_description}</p>

            <button
              className="vue-toggle-btn"
              onClick={() => toggleApplications(offer.offers_id)}
            >
              {expandedOffers[offer.offers_id]
                ? "Masquer les candidatures"
                : "Voir les candidatures"}
            </button>

            {expandedOffers[offer.offers_id] && (
              <div className="vue-applications-list">
                <h3 className="vue-applications-title">Candidatures reçues</h3>

                {loadingApps[offer.offers_id] && (
                  <p>Chargement des candidatures...</p>
                )}
                {errorApps[offer.offers_id] && (
                  <p style={{ color: "red" }}>{errorApps[offer.offers_id]}</p>
                )}

                {applications[offer.offers_id]?.length === 0 &&
                  !loadingApps[offer.offers_id] && (
                    <p>Aucune candidature reçue pour cette offre.</p>
                  )}

                {applications[offer.offers_id]?.map((app) => (
                  <ApplicationCard
                    key={app.users_id}
                    app={app}
                    offerId={offer.offers_id}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
