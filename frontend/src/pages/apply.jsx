import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchList, createEntity } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/style_apply.css";

export default function PostulerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("UserId");
  if (!userId)  { // si pas connecté, redirige vers connexion
    alert("Veuillez vous connecter pour postuler.");
    navigate("/connexion");
  }
  // const offerId = new URLSearchParams(location.search).get("offerId"); old si parm ?element=element
  const { offerId } = useParams();

  const [offer, setOffer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({
    offers_id: offerId,
    users_id: userId,
    candidate_phone: "",
    candidate_email: "",
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
    fetchList(`document?p:id_user=${userId}`)
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // add doc 
  const handleCreateDoc = async () => {
    if (!newDoc.name || !newDoc.file) return alert("Nom et fichier requis");
    setLoading(true);
    try {
      const res = await createEntity("document", { name: newDoc.name });
      setDocuments((prev) => [...prev, res]);
      setForm((f) => ({
        ...f,
        documents: [...f.documents, res.id],
      }));
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
        documents: already ? prev.documents.filter((id) => id !== docId) : [...prev.documents, docId],
      };
    });
  };

  // envoi candidature
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const paramsRqtePrincipal = { ...form };
      const paramsRqteSelectedDocument = { ...form.documents };
      console.log("Envoi candidature avec params =", paramsRqtePrincipal, "et fields =", paramsRqteSelectedDocument);
      await createEntity("application", paramsRqtePrincipal);

      await Promise.all(
        paramsRqteSelectedDocuments.map((documentId) =>
          createEntity("documentSelected", {
            documents_id: documentId,
            offers_id: paramsRqtePrincipal.offers_id
          })
        )
      );
      alert("Candidature envoyée !");
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ApplySection">
      {offer ? (
        <div className="OfferRecap">
          <h1>{offer.type} - {offer.title}</h1>
          <p className="offer-meta">
            {offer.company_name} — {offer.location}
          </p>
          <p className="offer-salary">{offer.salary.min_salary} - {offer.salary.max_salary} € / mois</p>
          <p className="offer-desc">{offer.description}</p>
        </div>
      ) : (
        <p>Chargement de l’offre...</p>
      )}

      <form className="ApplyForm" onSubmit={handleSubmit}>
        <h2>Vos informations</h2>
        <label>Email <input type="email" name="email" value={form.candidate_email} onChange={(e) => setForm({ ...form, candidate_email: e.target.value })} required/></label>
        <label>Téléphone <input type="tel" name="phone" value={form.candidate_phone} onChange={(e) => setForm({ ...form, candidate_phone: e.target.value })} required/></label>
        <label>Message <textarea name="message" placeholder="Votre message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /> </label>

        <h2>Documents joints</h2>
        <div className="DocSelectContainer">
          <select onChange={(e) => toggleDocument(e.target.value)} defaultValue="">
            <option value="" disabled>Sélectionner un document</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>

          <button type="button" className="Ws-Btn-Submit small" onClick={() => setForm({ ...form, showCreate: !form.showCreate })}>  + Nouveau document</button>
        </div>

        {/* af doc select */}
        <div className="SelectedDocs">
          {form.documents.map((id) => {
            const doc = documents.find((d) => d.id === id);
            if (!doc) return null;
            return (<span key={id} className="DocTag">{doc.name}<button type="button" className="RemoveDocBtn" onClick={() => toggleDocument(id)}>×</button></span>);
          })}
        </div>


        {/* frm crea new doc */}
        {form.showCreate && (
          <div className="CreateDocBox">
            <input type="text" placeholder="Nom du document" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}/>
            <input type="file" onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files[0] })}/>
            <button type="button" className="Ws-Btn-Submit" onClick={handleCreateDoc} disabled={loading}>{loading ? "Création..." : "Créer"}</button>
          </div>
        )}

        <button type="submit" className="Ws-Btn-Submit" disabled={loading || !offer}>{loading ? "Envoi..." : "Postuler à cette offre"}</button>
      </form>
    </section>
  );
}
