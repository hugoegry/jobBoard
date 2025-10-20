// import { useEffect, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import { fetchList, createEntity } from "../api";
// import { useNavigate } from "react-router-dom";
// import "../styles/style_apply.css";

// export default function PostulerPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const userId = sessionStorage.getItem("UserId");
//   const userStr = sessionStorage.getItem("userobj");
//   const user = userStr ? JSON.parse(userStr) : null;
//   if (!user)  { // si pas connecté, redirige vers connexion
//     alert("Veuillez vous connecter pour postuler.");
//     navigate("/connexion");
//   }

//   const { offerId } = useParams();

//   const [notification, setNotification] = useState(null);
//   const [countdown, setCountdown] = useState(null);

//   const [checkBackData, setCheckBackData] = useState(null);
//   const [checkBackLoading, setCheckBackLoading] = useState(true);

//   const [offer, setOffer] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [form, setForm] = useState({
//     offers_id: offerId,
//     users_id: user.user_id,
//     candidate_phone: user ? user.phone : "",
//     candidate_email: user ? user.email : "",
//     message: "",
//     documents: [],
//   });
//   const [newDoc, setNewDoc] = useState({ name: "", file: null });
//   const [loading, setLoading] = useState(false);

//   // recup l offre par id
//   useEffect(() => {
//     fetchList(`offer?p:offers_id=${offerId}`)
//       .then((res) => {
//         if (Array.isArray(res) && res.length > 0) setOffer(res[0]);
//         console.log(res);
//       })
//       .catch(console.error);
//   }, [offerId]);

//   // charge les doc add filtre de secu par user document \\
//   useEffect(() => {
//     fetchList(`document?p:id_user=${user.user_id}`)
//       .then((data) => setDocuments(Array.isArray(data) ? data : []))
//       .catch(console.error);
//   }, []);

//   useEffect(() => {
//     if (countdown === null) return;
//     const interval = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 0) {
//           clearInterval(interval);
//           navigate("/jobs");
//           return 0;
//         }
//         return +(prev - 0.1).toFixed(2);
//       });
//     }, 100);

//     return () => clearInterval(interval);
//   }, [navigate, countdown !== null]);


//   // requête parallèle
//   useEffect(() => {
//   const fetchCheckBack = async () => {
//     try {
//       const data = await fetchList("application", `p:offer_id=${offerId}&p:users_id=${user.user_id}`); // adapter le module
//       setCheckBackData(data);
//       setNotification({
//         message: "Vous avez déjà postulé à cette offre ⚠️",
//         actionText: "Retour aux offres",
//       });
//       setCountdown(5.0);
//     } catch (err) {
//       console.error("Erreur checkBack :", err.message);
//     } finally {
//       setCheckBackLoading(false);
//     }
//   };

//   fetchCheckBack();
// }, []);


//   // add doc 
//   const handleCreateDoc = async () => {
//     if (!newDoc.name || !newDoc.file) return alert("Nom et fichier requis");
//     setLoading(true);
//     try {
//       const res = await createEntity("document", { name: newDoc.name });
//       setDocuments((prev) => [...prev, res]);
//       setForm((f) => ({
//         ...f,
//         documents: [...f.documents, res.id],
//       }));
//       setNewDoc({ name: "", file: null });
//     } catch (err) {
//       alert("Erreur création document : " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ad et sup un doc
//   const toggleDocument = (docId) => {
//     setForm((prev) => {
//       const already = prev.documents.includes(docId);
//       return {
//         ...prev,
//         documents: already ? prev.documents.filter((id) => id !== docId) : [...prev.documents, docId],
//       };
//     });
//   };

//   // envoi candidature
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {

//       if (checkBackLoading) {
//         await new Promise((resolve) => {
//           const interval = setInterval(() => {
//             if (!checkBackLoading) {
//               clearInterval(interval);
//               resolve();
//             }
//           }, 100);
//         });
//       }

//       const paramsRqtePrincipal = { ...form };
//       const paramsRqteSelectedDocuments = [...form.documents];

//       console.log("Envoi candidature avec params =", paramsRqtePrincipal, "et fields =", paramsRqteSelectedDocuments);
//       await createEntity("application", paramsRqtePrincipal);

//       await Promise.all(
//         paramsRqteSelectedDocuments.map(async (documentId) => {
//           const returneddata = await createEntity("documentSelected", {
//             id_document: documentId,
//             id_offers: paramsRqtePrincipal.offers_id
//           });
//         })
//       );
//       //alert("Candidature envoyée !");
//       setNotification({
//         message: "Votre candidature a bien été envoyée 🎉",
//         actionText: "Retour aux offres",
//       });
//       setCountdown(5.0);
//     } catch (err) {
//       alert("Erreur : " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="ApplySection" style={{ pointerEvents: notification ? "none" : "auto"}}>
//       {offer ? (
//         <div className="OfferRecap">
//           <h1>{offer.type} - {offer.title}</h1>
//           <p className="offer-meta">
//             {offer.company_name} — {offer.location}
//           </p>
//           <p className="offer-salary">{offer.salary.min_salary} - {offer.salary.max_salary} € / mois</p>
//           <p className="offer-desc">{offer.description}</p>
//         </div>
//       ) : (
//         <p>Chargement de l’offre...</p>
//       )}

//       <form className="ApplyForm" onSubmit={handleSubmit}>
//         <h2>Vos informations</h2>
//         <label>Email <input type="email" name="email" value={form.candidate_email} onChange={(e) => setForm({ ...form, candidate_email: e.target.value })} required/></label>
//         <label>Téléphone <input type="tel" name="phone" value={form.candidate_phone} onChange={(e) => setForm({ ...form, candidate_phone: e.target.value })} required/></label>
//         <label>Message <textarea name="message" placeholder="Votre message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /> </label>

//         <h2>Documents joints</h2>
//         <div className="DocSelectContainer">
//           <select onChange={(e) => toggleDocument(e.target.value)} defaultValue="">
//             <option value="" disabled>Sélectionner un document</option>
//             {documents.map((doc) => (
//               <option key={doc.id} value={doc.id}>{doc.name}</option>
//             ))}
//           </select>

//           <button type="button" className="Ws-Btn-Submit small" onClick={() => setForm({ ...form, showCreate: !form.showCreate })}>  + Nouveau document</button>
//         </div>

//         {/* af doc select */}
//         <div className="SelectedDocs">
//           {form.documents.map((id) => {
//             const doc = documents.find((d) => d.id === id);
//             if (!doc) return null;
//             return (<span key={id} className="DocTag">{doc.name}<button type="button" className="RemoveDocBtn" onClick={() => toggleDocument(id)}>×</button></span>);
//           })}
//         </div>


//         {/* frm crea new doc */}
//         {form.showCreate && (
//           <div className="CreateDocBox">
//             <input type="text" placeholder="Nom du document" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}/>
//             <input type="file" onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files[0] })}/>
//             <button type="button" className="Ws-Btn-Submit" onClick={handleCreateDoc} disabled={loading}>{loading ? "Création..." : "Créer"}</button>
//           </div>
//         )}

//         {/* <button type="submit" className="Ws-Btn-Submit" disabled={loading || !offer}>{loading ? "Envoi..." : "Postuler à cette offre"}</button> */}
//         <button
//           type="submit"
//           className="Ws-Btn-Submit"
//           disabled={loading || checkBackLoading || !offer}
//         >
//           {(loading || checkBackLoading) ? <span className="loader" /> : "Postuler à cette offre"}
//         </button>
//       </form>
//       {notification && (
//         <div className="NotificationOverlay">
//           <div className="NotificationBox">
//             <h2>{notification.message}</h2>
//             <button className="Ws-Btn-Submit" onClick={() => navigate("/jobs")}>{notification.actionText}</button>
//             <p className="AutoRedirectText">Redirection automatique dans {(countdown).toFixed(1)} secondes...</p>
//             <div className="CountdownBar">
//               <div className="CountdownProgress" style={{ width: `${(countdown / 5) * 100}%` }} />
//             </div>
//           </div>
//         </div>
//       )}

//     </section>
//   );
// }


import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchList, createEntity } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/style_apply.css";

export default function PostulerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("UserId");
  const userStr = sessionStorage.getItem("userobj");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) {
    // si pas connecté, redirige vers connexion
    alert("Veuillez vous connecter pour postuler.");
    navigate("/connexion");
  }

  const { offerId } = useParams();

  const [notification, setNotification] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const [checkBackData, setCheckBackData] = useState(null);
  const [checkBackLoading, setCheckBackLoading] = useState(true);

  const [offer, setOffer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({
    offers_id: offerId,
    users_id: user.id,
    candidate_phone: user ? user.phone : "",
    candidate_email: user ? user.email : "",
    message: "",
    documents: [],
  });
  const [newDoc, setNewDoc] = useState({ name: "", file: null });
  const [loading, setLoading] = useState(false);
  // recup l offre par id
  useEffect(() => {
    fetchList(`offer?p:offers_id=${offerId}`)
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setOffer(res[0]);
        console.log(res);
      })
      .catch(console.error);
  }, [offerId]);

  // charge les doc add filtre de secu par user document \\
  useEffect(() => {
    fetchList(`document?p:id_user=${user.id}`)
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          navigate("/jobs");
          return 0;
        }
        return +(prev - 0.1).toFixed(2);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [navigate, countdown !== null]);

  // requête parallèle
  useEffect(() => {
    const fetchCheckBack = async () => {
      try {
        const data = await fetchList(
          "application",
          `p:offer_id=${offerId}&p:users_id=${user.id}`
        ); // adapter le module
        setCheckBackData(data);
        setNotification({
          message: "Vous avez déjà postulé à cette offre ⚠️",
          actionText: "Retour aux offres",
        });
        setCountdown(5.0);
      } catch (err) {
        console.error("Erreur checkBack :", err.message);
      } finally {
        setCheckBackLoading(false);
      }
    };

    fetchCheckBack();
  }, []);

  // add doc
  const handleCreateDoc = async () => {
    if (!newDoc.name || !newDoc.file) return alert("Nom et fichier requis");
    setLoading(true);

    try {
      const formDataDocument = new FormData();
      formDataDocument.append("file", newDoc.file);
      formDataDocument.append("name", newDoc.name);
      formDataDocument.append("id_user", user.id);

      const responseDoc = await fetch("http://localhost/api/document/", {
        method: "POST",
        credentials: "include",
        body: formDataDocument,
      });

      if (!responseDoc.ok) {
        throw new Error(`Erreur HTTP ${responseDoc.status} (document)`);
      }

      const dataDoc = await responseDoc.json();
      console.log("Réponse document :", dataDoc);

      if (dataDoc.file) {
        const fileUrl = `http://localhost:3000/uploads/${dataDoc.file}`;
        setFilePreview(fileUrl);
        sessionStorage.setItem("userFile", dataDoc.file);
      }

      if (dataDoc.id) {
        setDocuments((prev) => [...prev, dataDoc]);
        setForm((f) => ({
          ...f,
          documents: [...f.documents, dataDoc.id],
        }));
      }

      setNewDoc({ name: "", file: null });
    } catch (err) {
      alert("Erreur création document : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ad et sup un doc
  const toggleDocument = (docId) => {
    setForm((prev) => {
      const already = prev.documents.includes(docId);
      return {
        ...prev,
        documents: already
          ? prev.documents.filter((id) => id !== docId)
          : [...prev.documents, docId],
      };
    });
  };

  // envoi candidature
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (checkBackLoading) {
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (!checkBackLoading) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }

      const paramsRqtePrincipal = { ...form };
      const paramsRqteSelectedDocuments = [...form.documents];

      console.log(
        "Envoi candidature avec params =",
        paramsRqtePrincipal,
        "et fields =",
        paramsRqteSelectedDocuments
      );
      await createEntity("application", paramsRqtePrincipal);

      await Promise.all(
        paramsRqteSelectedDocuments.map(async (documentId) => {
          const returneddata = await createEntity("documentSelected", {
            id_document: documentId,
            id_offers: paramsRqtePrincipal.offers_id,
          });
        })
      );
      //alert("Candidature envoyée !");
      setNotification({
        message: "Votre candidature a bien été envoyée 🎉",
        actionText: "Retour aux offres",
      });
      setCountdown(5.0);
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="ApplySection"
      style={{ pointerEvents: notification ? "none" : "auto" }}
    >
      {offer ? (
        <div className="OfferRecap">
          <h1>
            {offer.type} - {offer.title}
          </h1>
          <p className="offer-meta">
            {offer.company_name} — {offer.location}
          </p>
          <p className="offer-salary">
            {offer.salary.min_salary} - {offer.salary.max_salary} € / mois
          </p>
          <p className="offer-desc">{offer.description}</p>
        </div>
      ) : (
        <p>Chargement de l’offre...</p>
      )}

      <form className="ApplyForm" onSubmit={handleSubmit}>
        <h2>Vos informations</h2>
        <label>
          Email{" "}
          <input
            type="email"
            name="email"
            value={form.candidate_email}
            onChange={(e) =>
              setForm({ ...form, candidate_email: e.target.value })
            }
            required
          />
        </label>
        <label>
          Téléphone{" "}
          <input
            type="tel"
            name="phone"
            value={form.candidate_phone}
            onChange={(e) =>
              setForm({ ...form, candidate_phone: e.target.value })
            }
            required
          />
        </label>
        <label>
          Message{" "}
          <textarea
            name="message"
            placeholder="Votre message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />{" "}
        </label>

        <h2>Documents joints</h2>
        <div className="DocSelectContainer">
          <select
            onChange={(e) => toggleDocument(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionner un document
            </option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="Ws-Btn-Submit small"
            onClick={() => setForm({ ...form, showCreate: !form.showCreate })}
          >
            {" "}
            + Nouveau document
          </button>
        </div>

        {/* af doc select */}
        <div className="SelectedDocs">
          {form.documents.map((id) => {
            const doc = documents.find((d) => d.id === id);
            if (!doc) return null;
            return (
              <span key={id} className="DocTag">
                {doc.name}
                <button
                  type="button"
                  className="RemoveDocBtn"
                  onClick={() => toggleDocument(id)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>

        {/* frm crea new doc */}
        {form.showCreate && (
          <div className="CreateDocBox">
            <input
              type="text"
              placeholder="Nom du document"
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
            />
            <input
              type="file"
              onChange={(e) =>
                setNewDoc({ ...newDoc, file: e.target.files[0] })
              }
            />
            <button
              type="button"
              className="Ws-Btn-Submit"
              onClick={handleCreateDoc}
              disabled={loading}
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        )}

        {/* <button type="submit" className="Ws-Btn-Submit" disabled={loading || !offer}>{loading ? "Envoi..." : "Postuler à cette offre"}</button> */}
        <button
          type="submit"
          className="Ws-Btn-Submit"
          disabled={loading || checkBackLoading || !offer}
        >
          {loading || checkBackLoading ? (
            <span className="loader" />
          ) : (
            "Postuler à cette offre"
          )}
        </button>
      </form>
      {notification && (
        <div className="NotificationOverlay">
          <div className="NotificationBox">
            <h2>{notification.message}</h2>
            <button className="Ws-Btn-Submit" onClick={() => navigate("/jobs")}>
              {notification.actionText}
            </button>
            <p className="AutoRedirectText">
              Redirection automatique dans {countdown.toFixed(1)} secondes...
            </p>
            <div className="CountdownBar">
              <div
                className="CountdownProgress"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
