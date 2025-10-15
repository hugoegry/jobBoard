import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { fetchList, createEntity } from "../api";
import "../styles/style_apply.css";

export default function PostulerPage() {
  const location = useLocation();
  // const offerId = new URLSearchParams(location.search).get("offerId");
  const { offerId } = useParams();

  const [offer, setOffer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
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
    fetchList("document") // add restricion p:user_id={userid recup en session}
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // add doc 
  const handleCreateDoc = async () => {
    if (!newDoc.name || !newDoc.file) return alert("Nom et fichier requis");
    setLoading(true);
    try {
      const res = await createEntity("document", {}, { name: newDoc.name });
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
        documents: already
          ? prev.documents.filter((id) => id !== docId)
          : [...prev.documents, docId],
      };
    });
  };

  // envoi quandidature
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = { offer_id: offerId };
      const fields = { ...form };
      await createEntity("application", params, fields);
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
        <label>Prénom <input type="text" name="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required/></label>
        <label>Nom <input type="text" name="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required/></label>
        <label>Téléphone <input type="tel" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required/></label>

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
