import React, { useState, useEffect } from "react";

function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
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
    setUser(savedUser);
    if (savedUser.file) {
      setFilePreview(`http://localhost:3000/uploads/${savedUser.file}`);
    }
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
      const formDataUser = new FormData();
      formDataUser.append("p:id", sessionStorage.getItem("UserId"));
      formDataUser.append("f:email", user.email);
      formDataUser.append("f:first_name", user.first_name);
      formDataUser.append("f:last_name", user.last_name);
      formDataUser.append("f:phone", user.phone);

      const responseUser = await fetch("http://localhost/api/user/file", {
        method: "PUT",
        body: formDataUser,
      });

      if (!responseUser.ok)
        throw new Error(`Erreur HTTP ${responseUser.status} (user)`);

      const dataUser = await responseUser.json();
      console.log("✅ Réponse user :", dataUser);

      // Mettre à jour les infos en session
      sessionStorage.setItem("userEmail", dataUser.email);
      sessionStorage.setItem("userFirstName", dataUser.first_name);
      sessionStorage.setItem("userLastName", dataUser.last_name);
      sessionStorage.setItem("userPhone", dataUser.phone);

      // 2. Si un fichier est présent -> upload document
      if (fileInput && fileInput.files[0]) {
        const formDataDocument = new FormData();
        formDataDocument.append("file", fileInput.files[0]); // nom attendu par multer
        formDataDocument.append("id_user", sessionStorage.getItem("UserId")); // nom attendu par le back

        const responseDoc = await fetch("http://localhost/api/document/", {
          method: "POST",
          body: formDataDocument,
        });

        if (!responseDoc.ok)
          throw new Error(`Erreur HTTP ${responseDoc.status} (document)`);

        const dataDoc = await responseDoc.json();
        console.log("📄 Réponse document :", dataDoc);

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
            filePreview.startsWith("data:image") ? (
              <a href={filePreview} target="_blank" rel="noreferrer">
                Voir l'image
              </a>
            ) : (
              <a
                href={`http://localhost:3000/uploads/${user.file}`}
                target="_blank"
                rel="noreferrer"
              >
                Voir le document
              </a>
            )
          ) : (
            <p className="no-file">Aucun document</p>
          )}

          {isEditing && (
            <input
              type="file"
              id="UserFile"
              name="file"
              className="file-input"
              onChange={handleFileChange}
            />
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
