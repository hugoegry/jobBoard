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
  const [filters, setFilters] = useState({}); 

  useEffect(() => {
    const userDataStr = sessionStorage.getItem("userobj");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const companyId = userData ? userData.societys[0].company_id : null; // axe d amelioration : gerer plusieurs entreprises a la fois \\
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

  const toggleApplications = async (offerId) => { // Toggle pour voir les candidatures
    setExpandedOffers((prev) => ({...prev, [offerId]: !prev[offerId],}));

    // Si jamais pas encore chargé, fetch les candidatures
    if (!applications[offerId]) {
      setLoadingApps((prev) => ({ ...prev, [offerId]: true }));

      try {
        const res = await fetch(`http://localhost/api/application/search?p:offer_id=${offerId}`, { // &p:status=En-Attente
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

  const handleFilterChange = (offerId, filterType) => { // Gère les filtres \\
    setFilters((prev) => {
      const current = prev[offerId] || { accepted: false, rejected: false, pending: false };
      return {
        ...prev,
        [offerId]: { ...current, [filterType]: !current[filterType] },
      };
    });
  };

  //  Met à jour le statut d'une candidature
  const updateApplicationStatus = async (idOffer, idUser, status) => {
    console.log(`Mise à jour de l'offre ${idOffer} pour l'utilisateur ${idUser} au statut ${status}`);
    try {
      const body = {"p:offers_id": idOffer, "p:users_id": idUser, "f:status": status};
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

  const handleAccept = (idOffer, idUser) => updateApplicationStatus(idOffer, idUser, "Acceptée");
  const handlePending = (idOffer, idUser) => updateApplicationStatus(idOffer, idUser, "En-Attente");
  const handleReject = (idOffer, idUser) => updateApplicationStatus(idOffer, idUser, "Refusée");

  if (loadingOffers) return <p>Chargement des offres...</p>;
  if (errorOffers) return <p style={{ color: "red" }}>{errorOffers}</p>;

  const ApplicationCard = ({ app, offerId }) => (
    <div
      className={`vue-application-card ${
        app.status === "Acceptée" ? "accepted" : app.status === "Refusée" ? "rejected" : ""
      }`}>
      <div className="vue-application-info">
        <p>Message : {app.message}</p>
        <p>Email : {app.candidate_email}</p>
        <p>Téléphone : {app.candidate_phone}</p>
        {app.status && <p>Status : {app.status}</p>}
      </div>
      <div className="vue-application-actions">
        {app.status !== "En-Attente" && (
          <button className="vue-pending-btn"onClick={() => handlePending(offerId, app.users_id)} disabled={app.status === "En-Attente"}>Remettre en attente</button>
        )}

        {app.status !== "Acceptée" && (
          <button className="vue-accept-btn" onClick={() => handleAccept(offerId, app.users_id)} disabled={app.status === "Acceptée"}>Accepter</button>
        )}

        {app.status !== "Refusée" && (
          <button className="vue-reject-btn" onClick={() => handleReject(offerId, app.users_id)} disabled={app.status === "Refusée"}>Refuser</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="vue-offer-container">
      {offers.length === 0 ? (
        <p>Aucune offre disponible pour cette entreprise.</p>
      ) : (
        offers.map((offer, index) => (
          <div key={`${offer.company_id}_${offer.offers_id}_${index}`} className="vue-offer-card">
            <div className="vue-filter-box">
              <label><input type="checkbox" checked={filters[offer.offers_id]?.accepted || false} onChange={() => handleFilterChange(offer.offers_id, "accepted")}/>Acceptées</label>
              <label><input type="checkbox" checked={filters[offer.offers_id]?.rejected || false} onChange={() => handleFilterChange(offer.offers_id, "rejected")}/>Refusées</label>
              <label><input type="checkbox" checked={filters[offer.offers_id]?.pending || false} onChange={() => handleFilterChange(offer.offers_id, "pending")}/>En attente</label>
            </div>
            <h2 className="vue-offer-title">{offer.company_name} - {offer.title}</h2>
            <p className="vue-offer-company">{offer.company}</p>
            <p className="vue-offer-location">{offer.location}</p>
            <p className="vue-offer-description">{offer.company_description}</p>

            <button className="vue-toggle-btn" onClick={() => toggleApplications(offer.offers_id)}>{expandedOffers[offer.offers_id] ? "Masquer les candidatures" : "Voir les candidatures"}</button>
              {console.log('applications globales', applications)}
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

                {applications[offer.offers_id]?.filter((app) => {
                  const f = filters[offer.offers_id] || {};
                  const anyChecked = f.accepted || f.rejected || f.pending;

                  if (!anyChecked) return true; // si aucune case cochée, afficher tout

                  if (f.accepted && app.status === "Acceptée") return true;
                  if (f.rejected && app.status === "Refusée") return true;
                  if (f.pending && app.status === "En-Attente") return true;
                  return false;
                })
                .map((app, index) => (
                  console.log('application filtrée', app),
                  console.log('filters pour cette offre', offer.offers_id, '8898989'),
                  <ApplicationCard key={`${offer.offers_id}_${app.users_id}_${index}`} app={app} offerId={offer.offers_id} />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
