import React, { useState, useEffect } from "react";

function AccountPage() {
  // Charger les infos utilisateur depuis le sessionStorage
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser
      ? JSON.parse(savedUser)
      : { email: "", first_name: "", last_name: "", phone: "", file: null };
  });

  const [formData, setFormData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [filePreview, setFilePreview] = useState(user.file || null);

  useEffect(() => {
    setFormData(user);
    setFilePreview(user.file || null);
  }, [user]);

  // Gérer les inputs de texte
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Gérer le choix d'un fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          file: reader.result, // base64 du fichier
        });
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sauvegarde des données dans sessionStorage
  const handleSave = () => {
    sessionStorage.setItem("user", JSON.stringify(formData));
    setUser(formData);
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
          value={sessionStorage.getItem("email")}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Prénom :</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Nom :</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Téléphone :</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={!isEditing}
        />

        {/* === Section Fichier === */}
        <div className="file-section">
          <label>Document associé :</label>
          {filePreview ? (
            <div className="file-preview">
              {/* Si c’est une image, on l’affiche. Sinon on affiche juste un lien */}
              {filePreview.startsWith("data:image") ? (
                <img src={filePreview} alt="document" />
              ) : (
                <a href={filePreview} target="_blank" rel="noreferrer">
                  Voir le document
                </a>
              )}
            </div>
          ) : (
            <p className="no-file">Aucun document</p>
          )}

          {isEditing && (
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
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
            <button
              className="cancel-button"
              onClick={() => {
                setFormData(user);
                setFilePreview(user.file || null);
                setIsEditing(false);
              }}
            >
              Annuler
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default AccountPage;
