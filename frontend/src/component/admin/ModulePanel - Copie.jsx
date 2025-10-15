import React, { useEffect, useState } from "react";
import { fetchList, updateEntity, deleteEntity, createEntity } from "../../api.js";

export default function ModulePanel({ moduleName }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [selectOptions, setSelectOptions] = useState({});

  // === Chargement initial ===
  useEffect(() => {
    fetchList(moduleName)
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setItems([]);
      });
  }, [moduleName]);

  // === Recherche temps réel ===
  const filteredItems = items.filter(item =>
    Object.values(item).some(v =>
      String(v).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // === Suppression ===
  const handleDelete = async (item) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    try {
      await deleteEntity(moduleName, { id: item.id });
      setItems(items.filter(i => i.id !== item.id));
    } catch (err) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  // === Edition inline ===
  const handleSave = async () => {
    if (!editing) return;
    const { idRow, idTuple, key, value } = editing;
    try {
      const tablePrefix = (idTuple && typeof idTuple === "object" && idTuple.table) ? idTuple.table : "";   
      const displayKey = (tablePrefix && key.startsWith(`${tablePrefix}_`)) ? key.slice(tablePrefix.length + 1) : key;
      await updateEntity(idTuple.table, { id: idTuple.id }, { [displayKey]: value });
      setItems(items.map(i => (i.id === idRow ? { ...i, [key]: value } : i)));
      setEditing(null);
    } catch (err) {
      alert("Erreur lors de la mise à jour : " + err.message);
    }
  };

  const startEditing = (idRow, idTuple, key, value) => {
    setEditing({ idRow, idTuple, key, value });
  };

  function resolveRefId(item, key, moduleName) {
    const idKeys = Object.keys(item).filter(k => k.endsWith("_id"));
    if (idKeys.length !== 0) {
      const keyBase = key.includes("_") ? key.split("_")[0] : null;
      if (keyBase) {
        const exactMatch = idKeys.find(k => k === `${keyBase}_id`);
        if (exactMatch) return { table: keyBase, id: item[exactMatch] };
      }
    }
    if (item.id) return { table: moduleName, id: item.id };
    if (moduleName) {
      const moduleMatch = idKeys.find(k => k === `${moduleName}_id`);
      if (moduleMatch) return { table: moduleName, id: item[moduleMatch] };
    }
    return { table: moduleName, id: item[idKeys[0]] };
  }

  function resolvePrimaryId(item, moduleName) {
    if (item.id) return item.id;
    const idKeys = Object.keys(item).filter(k => k.endsWith("_id"));
    if (idKeys.length === 0) return null;
    const singularKey = `${moduleName}_id`;
    const pluralKey = `${moduleName}s_id`;
    if (idKeys.includes(singularKey)) return item[singularKey];
    if (idKeys.includes(pluralKey)) return item[pluralKey];
    return item[idKeys[0]];
  }

  // === Création ===
  const handleCreateClick = () => {
    if (items.length > 0) {
      const template = { ...items[0] };
      delete template.id;
      setNewItem(Object.fromEntries(Object.keys(template).map(k => [k, ""])));
      setShowCreatePopup(true);

      // Préparer les options pour les champs *_id
      Object.keys(template).forEach(async key => {
        if (key.endsWith("_id")) {
          const relatedTable = key.split("_")[0];
          try {
            const data = await fetchList(relatedTable);
            setSelectOptions(prev => ({ ...prev, [key]: data }));
          } catch (err) {
            console.warn(`Erreur de chargement des ${relatedTable}:`, err);
          }
        }
      });
    } else {
      alert("Impossible de créer un élément : aucun modèle de données détecté.");
    }
  };

  const handleConfirmCreate = async () => {
    // Validation
    for (const [key, value] of Object.entries(newItem)) {
      if (!value) {
        alert(`Le champ "${key}" est obligatoire.`);
        return;
      }
    }

    try { // await updateEntity(idTuple.table, { id: idTuple.id }, { [displayKey]: value });  createEntity
      await createEntity(moduleName, newItem);
      const updated = await fetchList(moduleName);
      setItems(updated);
      setShowCreatePopup(false);
    } catch (err) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  return (
    <div className="module-panel">
      <div className="header-module">
        <div className="searchText">
          <input
            type="text"
            placeholder=" "
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <span>Text</span>
        </div>
        <button className="createButton" id="createButton" onClick={handleCreateClick}>
          Create
        </button>
      </div>

      {filteredItems.length === 0 && <div>Aucun élément trouvé</div>}

      {filteredItems.map((item, idx) => (
        <div key={item.id || idx} className={`module-row ${idx % 2 === 0 ? "even" : "odd"}`}>
          <div className="item-content">
            {Object.entries(item).map(([key, value]) => {
              const rowId = resolvePrimaryId(item, moduleName);
              const refId = resolveRefId(item, key, moduleName);
              return (
                <div key={key} className="item-field" onDoubleClick={() => startEditing(rowId, refId, key, value)}>
                  <strong>{key}: </strong>
                  <span>{String(value)}</span>
                </div>
              );
            })}
          </div>
          <div className="item-actions">
            <button className="btn-delete" onClick={() => handleDelete(item)}>Supprimer</button>
          </div>
        </div>
      ))}

      {/* Popup modification existant */}
      {editing && editing.key && (
        <div className="edit-popup">
          <h4>Modifier {editing.key}</h4>
          <textarea
            value={editing.value}
            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
            rows={4}
          />
          <div className="button-popup" style={{ marginTop: 8 }}>
            <button className="btn" onClick={handleSave}>Save</button>
            <button className="btn ghost" onClick={() => setEditing(null)}>Annuler</button>
          </div>
        </div>
      )}

      {/* Popup création */}
      {showCreatePopup && (
        <div className="popup-overlay">
          <div className="create-popup">
            <h4>Créer un nouvel élément</h4>
            <div className="popup-fields">
              {Object.entries(newItem)
              .filter(([key]) =>
                key.endsWith("_id") &&
                !key.startsWith(moduleName) &&
                !key.startsWith(moduleName + "s")
              ).map(([key, value]) => (key.endsWith("_id") && !key.startsWith(moduleName) && !key.startsWith(moduleName + 's')) || !key.endsWith("_id") ? (
                <div key={key} className="popup-field">
                    <label>{key}</label>
                  {key.endsWith("_id") && !key.startsWith(moduleName) && !key.startsWith(moduleName + 's') ? (
                    <select value={value} onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })}>
                      <option value="">-- Sélectionner --</option>
                      {(selectOptions[key] || []).map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name || `#${opt.id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })}
                    />
                  )}
                </div>
              ) : null)}
            </div>
            <div className="popup-actions">
              <button onClick={() => setShowCreatePopup(false)}>Annuler</button>
              <button onClick={handleConfirmCreate}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
