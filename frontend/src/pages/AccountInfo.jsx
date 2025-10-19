import React, { useState, useEffect } from "react";

function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [documentUser, setDocumentUser] = useState(null);
  const [user, setUser] = useState({
    id: sessionStorage.getItem("UserId") || "",
    email: sessionStorage.getItem("userEmail") || "",
    first_name: sessionStorage.getItem("userFirstName") || "",
    last_name: sessionStorage.getItem("userLastName") || "",
    phone: sessionStorage.getItem("userPhone") || "",
    file: sessionStorage.getItem("userFile") || null,
  });

  useEffect(() => {
    const savedUser = {
      email: sessionStorage.getItem("userEmail") || "",
      first_name: sessionStorage.getItem("userFirstName") || "",
      last_name: sessionStorage.getItem("userLastName") || "",
      phone: sessionStorage.getItem("userPhone") || "",
      file: sessionStorage.getItem("userFile") || null,
    };
    if (
      savedUser.email ||
      savedUser.first_name ||
      savedUser.last_name ||
      savedUser.phone
    ) {
      setUser(savedUser);
    }
    console.log(sessionStorage.getItem("userPhone"));
    if (savedUser.file) {
      setFilePreview(`http://localhost:3000/uploads/${savedUser.file}`);
    }
    fetch(`http://localhost/api/document/search?p:id_user=${sessionStorage.getItem("UserId")}`, {
      method: "GET",
      credentials: "include", // Inclure les cookies pour la session
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }
        return response.json();
      })
      .then((data) => {
        setDocumentUser(data); // 🔸 On stocke les données dans le state
      })
      .catch((error) => {
        console.error("Erreur:", error);
      });
  }, []);

  //  mettre à jour les champs dans le state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion du fichier local (aperçu)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      sessionStorage.setItem("userFile", reader.result);
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Sauvegarde sur le serveur (update user + ajout document)
  const handleSave = async () => {
    try {
      const fileInput = document.getElementById("UserFile");

      // 1. Préparer FormData pour l'utilisateur
      const body = {
        "p:id": sessionStorage.getItem("UserId"),
        "f:email": user.email,
        "f:first_name": user.first_name,
        "f:last_name": user.last_name,
        "f:phone": user.phone,
      };

      const responseUser = await fetch("http://localhost/api/user/", {
        method: "PUT",
        credentials: "include", // Inclure les cookies pour la session
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!responseUser.ok)
        throw new Error(`Erreur HTTP ${responseUser.status} (user)`);

      const dataUser = await responseUser.json();
      console.log("Réponse user :", dataUser);

      // Mettre à jour les infos en session
      sessionStorage.setItem("userEmail", dataUser[0].email);
      sessionStorage.setItem("userFirstName", dataUser[0].first_name);
      sessionStorage.setItem("userLastName", dataUser[0].last_name);
      sessionStorage.setItem("userPhone", dataUser[0].phone);

      // 2. Si un fichier est présent -> upload document
      if (fileInput && fileInput.files[0]) {
        const formDataDocument = new FormData();
        formDataDocument.append("file", fileInput.files[0]); // nom attendu par multer
        formDataDocument.append("id_user", sessionStorage.getItem("UserId")); // nom attendu par le back

        const responseDoc = await fetch("http://localhost/api/document/", {
          method: "POST",
          credentials: "include", // Inclure les cookies pour la session
          body: formDataDocument,
        });

        if (!responseDoc.ok)
          throw new Error(`Erreur HTTP ${responseDoc.status} (document)`);

        const dataDoc = await responseDoc.json();
        console.log(" Réponse document :", dataDoc);

        if (dataDoc.file) {
          const fileUrl = `http://localhost:3000/uploads/${dataDoc.file}`;
          setFilePreview(fileUrl);
          sessionStorage.setItem("userFile", dataDoc.file);
        }
      }

      setIsEditing(false);
      alert("✅ Mise à jour réussie !");
    } catch (err) {
      console.error("Erreur serveur lors de la mise à jour :", err);
      alert("❌ Erreur serveur lors de la mise à jour.");
    }
  };
  const handleDeleteFile = async () => {
    const idDocumentDelete = document.getElementById("Ws-Select-File").value;

    try {
      const response = await fetch(`http://localhost/api/document/${idDocumentDelete}`, {
          method: "DELETE",
          credentials: "include", // Inclure les cookies pour la session
        }
      );

      const text = await response.text(); // 👈 on lit en texte d'abord
      console.log(" Réponse brute :", text);

      let data;
      try {
        data = JSON.parse(text); // 👈 on tente de parser
      } catch (e) {
        console.error(
          "⚠️ La réponse n'est pas du JSON. Peut-être une erreur serveur."
        );
        return;
      }

      if (!response.ok) {
        console.error("❌ Erreur de suppression :", data);
        return;
      }

      console.log(" Fichier supprimé :", data);
    } catch (err) {
      console.error("⚠️ Erreur réseau :", err);
    }
  };

  const handleCancel = () => {
    setUser({
      id: sessionStorage.getItem("UserId") || "",
      email: sessionStorage.getItem("userEmail") || "",
      first_name: sessionStorage.getItem("userFirstName") || "",
      last_name: sessionStorage.getItem("userLastName") || "",
      phone: sessionStorage.getItem("userPhone") || "",
      file: sessionStorage.getItem("userFile") || null,
    });
    setFilePreview(sessionStorage.getItem("userFile") || null);
    setIsEditing(false);
  };

  return (
    <section className="SectionAccountContainer">
      <div className="account-container">
        <h2>Mon compte</h2>

        <label>Adresse email :</label>
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleInputChange}
          disabled={!isEditing}
          id="UserEmail"
        />

        <label>Prénom :</label>
        <input
          type="text"
          name="first_name"
          value={user.first_name}
          onChange={handleInputChange}
          disabled={!isEditing}
          id="UserFirstName"
        />

        <label>Nom :</label>
        <input
          type="text"
          name="last_name"
          value={user.last_name}
          onChange={handleInputChange}
          disabled={!isEditing}
          id="UserLastName"
        />

        <label>Téléphone :</label>
        <input
          type="text"
          name="phone"
          value={user.phone}
          onChange={handleInputChange}
          disabled={!isEditing}
          id="UserPhone"
        />

        <div className="file-section">
          <label>Document associé :</label>

          {filePreview ? (
            <>
              <a
                href={`http://localhost:3000/uploads/${user.file}`}
                target="_blank"
                rel="noreferrer"
              >
                Voir le document
              </a>
              <br />
              <select name="" id="Ws-Select-File" className="Ws-Select-File">
                {Array.isArray(documentUser) && documentUser.length > 0 ? (
                  documentUser.map((document, index) => (
                    <option key={index} value={document.id}>
                      {document.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Aucun document disponible</option>
                )}
              </select>
            </>
          ) : (
            <p className="no-file">Aucun document</p>
          )}

          {isEditing && (
            <>
              <button className="DeleteFile" onClick={handleDeleteFile}>
                supprimé
              </button>
              <input
                type="file"
                id="UserFile"
                name="file"
                className="file-input"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {!isEditing ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Modifier mes informations
          </button>
        ) : (
          <>
            <button className="save-button" onClick={handleSave}>
              Enregistrer
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Annuler
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default AccountPage;
