import { useState, useEffect } from "react";
import "../styles/style_vueEmployeur.css";
import { fetchList, createEntity, deleteEntity, updateEntity } from "../api";

export default function VueEmployeur() {
  const [offers, setOffers] = useState([]);
  const [expandedOffers, setExpandedOffers] = useState({}); // { offerId: true/false }
  const [applications, setApplications] = useState({}); // { offerId: [...applications] }
  const [loadingApps, setLoadingApps] = useState({}); // { offerId: boolean }
  const [errorApps, setErrorApps] = useState({}); // { offerId: string }
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorOffers, setErrorOffers] = useState(null);
  const [filters, setFilters] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    company_id: "",
    title: "",
    description: "",
    location: "",
    tags: "",
    external_url: "",
    type: "",
    collect_application: true,
    recruiter_email: "",
    salary_min: "",
    salary_max: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [originalOffer, setOriginalOffer] = useState({});

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

  //-----------------------

  const createOffer = async () => {
    const userData = JSON.parse(sessionStorage.getItem("userobj"));
    const companyId = userData?.societys[0]?.company_id;

    if (!companyId) {
      setCreateError("Aucune entreprise associée à cet utilisateur.");
      return;
    }

    if (!newOffer.title || !newOffer.location || !newOffer.description) {
      setCreateError("Tous les champs sont obligatoires.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const bodyRqte = {
        "company_id": companyId,
        "title": newOffer.title,
        "description": newOffer.description,
        "location": newOffer.location,
        "tags": newOffer.tags,
        "external_url": newOffer.external_url,
        "type": newOffer.type,
        "collect_application": newOffer.collect_application,
        "recruiter_email": newOffer.recruiter_email,
        "salary": {
          min_salary: Number(newOffer.salary_min),
          max_salary: Number(newOffer.salary_max),
        },
      };

      const data = await createEntity("offer", bodyRqte);
      console.log("Réponse création offre :", data);

      if (!data) {
        throw new Error("Réponse vide du serveur lors de la création de l’offre");
      }


      const createdOffer = Array.isArray(data) ? data[0] : data;
      console.log("Offre créée :", createdOffer);

      setOffers((prev) => [...prev, createdOffer]);
      setNewOffer({ title: "", location: "", description: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };
  
  //-------------------- sup offre --------------------
  const deleteOffer = async (offerId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;
    try {
      console.log("Suppression de l'offre ID :", offerId);
      await deleteEntity("offer", { id: offerId });

      //if (!response.ok) throw new Error("Erreur lors de la suppression de l’offre");

      setOffers((prev) => prev.filter((offer) => offer.offers_id !== offerId));
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer l’offre : " + err.message);
    }
  };

  //-------------------- update offre --------------------
  const handleEditOffer = (offer) => {
    setIsEditing(true);
    setEditOfferId(offer.offers_id);
    setOriginalOffer(offer);

    setNewOffer({
      title: offer.title || "",
      description: offer.description || "",
      location: offer.location || "",
      tags: offer.tags || "",
      external_url: offer.external_url || "",
      type: offer.type || "",
      collect_application: offer.collect_application ?? true,
      recruiter_email: offer.recruiter_email || "",
      salary_min: offer.salary?.min_salary || "",
      salary_max: offer.salary?.max_salary || "",
    });
    setIsModalOpen(true);
  };

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

  //-------------------- update offre --------------------
  const updateOffer = async () => {
    if (!editOfferId) return;
    try {
      const changedFields = Object.entries(newOffer).reduce((acc, [key, value]) => {
        if (value !== originalOffer[key]) acc[key] = value;
        return acc;
      }, {});

      if (Object.keys(changedFields).length === 0) {
        alert("Aucune modification détectée.");
        return;
      }

      await updateEntity("offer", { id: editOfferId }, changedFields);

      // mise a jour loc
      setOffers((prev) =>
        prev.map((offer) => {
          if (offer.offers_id != editOfferId) return offer;

          const updatedOffer = { ...offer, ...changedFields };

          // Gérer le salary
          if (changedFields.salary_min || changedFields.salary_max) {
            updatedOffer.salary = {
              min_salary: Number(changedFields.salary_min ?? offer.salary?.min_salary ?? 0),
              max_salary: Number(changedFields.salary_max ?? offer.salary?.max_salary ?? 0),
            };
            delete updatedOffer.salary_min;
            delete updatedOffer.salary_max;
          }

          return updatedOffer;
        })
      );

      // reset
      setIsModalOpen(false);
      setIsEditing(false);
      setEditOfferId(null);
      setOriginalOffer({});
      setNewOffer({
        company_id: "",
        title: "",
        description: "",
        location: "",
        tags: "",
        external_url: "",
        type: "",
        collect_application: true,
        recruiter_email: "",
        salary_min: "",
        salary_max: "",
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de l’offre : " + err.message);
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
      <button className="vue-create-offer-btn" onClick={() => setIsModalOpen(true)}>+ Nouvelle offre</button>
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
            <h2 className="vue-offer-title">{offer.company_name || offers[0].company_name} - {offer.title}</h2>
            <p className="vue-offer-company">{offer.company}</p>
            <p className="vue-offer-location">{offer.location}</p>
            <p className="vue-offer-description">{offer.company_description}</p>

            <button className="vue-toggle-btn" onClick={() => toggleApplications(offer.offers_id)}>{expandedOffers[offer.offers_id] ? "Masquer les candidatures" : "Voir les candidatures"}</button>
            <button className="vue-edit-btn" onClick={() => handleEditOffer(offer)} style={{ backgroundColor: "orange", color: "white", marginTop: "8px" }}>Modifier l’offre</button>
            <button className="vue-delete-btn" onClick={() => deleteOffer(offer.offers_id)} style={{ backgroundColor: "darkred", color: "white", marginTop: "8px" }}>Supprimer l’offre</button>
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
                  <ApplicationCard key={`${offer.offers_id}_${app.users_id}_${index}`} app={app} offerId={offer.offers_id} />
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {isModalOpen && (
        <div className="vue-modal-overlay">
          <div className="vue-modal">
            <h3>{isEditing ? "Modifier l’offre" : "Créer une nouvelle offre"}</h3>

            <input
              type="text"
              placeholder="Titre"
              value={newOffer.title}
              onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              rows={3}
              value={newOffer.description}
              onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
            ></textarea>
            <input
              type="text"
              placeholder="Localisation"
              value={newOffer.location}
              onChange={(e) => setNewOffer({ ...newOffer, location: e.target.value })}
            />
            <input
              type="text"
              placeholder="Tags (séparés par des virgules)"
              value={newOffer.tags}
              onChange={(e) => setNewOffer({ ...newOffer, tags: e.target.value })}
            />
            <input
              type="url"
              placeholder="Lien externe (URL de l'offre)"
              value={newOffer.external_url}
              onChange={(e) => setNewOffer({ ...newOffer, external_url: e.target.value })}
            />
            <select value={newOffer.type} onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })} className="vue-modal-select">
              <option value="">-- Sélectionner un type de contrat --</option>
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="alternance">Alternance</option>
              <option value="mi-temps">Mi-temps</option>
              <option value="freelance">Freelance</option>
              <option value="stage">Stage</option>
              <option value="benevolat">Bénévolat</option>
            </select>
            <input
              type="email"
              placeholder="Email du recruteur"
              value={newOffer.recruiter_email}
              onChange={(e) => setNewOffer({ ...newOffer, recruiter_email: e.target.value })}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="Salaire min"
                value={newOffer.salary_min}
                onChange={(e) => setNewOffer({ ...newOffer, salary_min: e.target.value })}
              />
              <input
                type="number"
                placeholder="Salaire max"
                value={newOffer.salary_max}
                onChange={(e) => setNewOffer({ ...newOffer, salary_max: e.target.value })}
              />
            </div>

            {createError && <p style={{ color: "red" }}>{createError}</p>}

            <div className="vue-modal-actions">
              <button onClick={isEditing ? updateOffer : createOffer} disabled={creating}>{creating ? (isEditing ? "Mise à jour..." : "Création...") : (isEditing ? "Mettre à jour" : "Créer")}</button>
              <button onClick={() => setIsModalOpen(false)}>Annuler</button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
