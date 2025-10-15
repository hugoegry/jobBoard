import React, { useState } from "react";

export default function EntityForm({ initial = {}, onCancel, onCreate, onUpdate }) {
  const [obj, setObj] = useState(initial);

  // Génère les champs à partir de l'objet initial
  const fields = Object.keys(obj).filter(k => k !== "id"); // Exclure l'id

  function handleChange(key, value) {
    setObj({ ...obj, [key]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (obj.id) onUpdate(obj);
    else onCreate(obj);
  }

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((key) => {
        const value = obj[key];
        // Détection simple type
        if (typeof value === "boolean") {
          return (
            <div className="form-row" key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleChange(key, e.target.checked)}
                />{" "}
                {key}
              </label>
            </div>
          );
        } else if (typeof value === "string" && value.length > 50) {
          // Long text -> textarea
          return (
            <div className="form-row" key={key}>
              <label>{key}</label>
              <textarea
                className="input"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          );
        } else {
          // input classique
          return (
            <div className="form-row" key={key}>
              <label>{key}</label>
              <input
                className="input"
                type="text"
                value={value || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          );
        }
      })}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn" type="submit">
          Enregistrer
        </button>
        <button className="btn ghost" type="button" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
