import React, { useEffect, useState } from "react";
import { fetchList, updateEntity, deleteEntity, createEntity } from "../../api.js";

export default function ModulePanel({ moduleName }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // { itemId, key, value }

  const [searchText, setSearchText] = useState("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [selectOptions, setSelectOptions] = useState({});

  useEffect(() => {
    fetchList(moduleName)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const enrichedList = list.map(item => {
        if (item.hasOwnProperty('id')) {
          return { ...item, id: item.id };
        }
        const alternatives = [`${moduleName}_id`, `${moduleName}s_id`];
        for (let alt of alternatives) {
          if (item.hasOwnProperty(alt)) {
            return { ...item, id: item[alt] };
          }
        }
        return { ...item, id: null };
      }); 

      setItems(enrichedList);
    })
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

  const handleDelete = async (item) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    try {
      await deleteEntity(moduleName, { id: item.id });
      setItems(items.filter(i => i.id !== item.id));
    } catch (err) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    const { idRow, idTuple, key, value } = editing;
    try {
      const tablePrefix = (idTuple && typeof idTuple === 'object' && idTuple.table) ? idTuple.table : '';   
      const displayKey = (tablePrefix && key.startsWith(`${tablePrefix}_`)) ? key.slice(tablePrefix.length + 1) : key;
      await updateEntity(idTuple.table, { id: idTuple.id }, { [displayKey]: value });
      // Mise à jour locale \\
      const syncedItems = items.map(item => {
        if (item.id) return item;
        if (!moduleName || typeof moduleName !== 'string') return item;

        const singularKey = `${moduleName}_id`;
        const pluralKey = `${moduleName}s_id`;

        if (singularKey in item && item[singularKey] != null) return { ...item, id: item[singularKey] };
        if (pluralKey in item && item[pluralKey] != null) return { ...item, id: item[pluralKey] };
        return item;
      });
      setItems(syncedItems.map(i => (i.id === idRow ? { ...i, [key]: value } : i)));
      setEditing(null);
    } catch (err) {
      alert("Erreur lors de la mise à jour : " + err.message);
    }
  };

  const startEditing = (idRow, idTuple, key, value) => {
    setEditing({ idRow, idTuple, key, value });
  };

  function resolveRefId(item, key, moduleName) { // on resoud l id de lelement qu on clique permet de modif les element meme si c est des element de liaison dans une vue \\
    const idKeys = Object.keys(item).filter(k => k.endsWith('_id'));
    if (idKeys.length !== 0) {
      const keyBase = key.includes('_') ? key.split('_')[0] : null; // recu la premier partie de lelement exemple company_id
      if (keyBase) {
        const exactMatch = idKeys.find(k => k === `${keyBase}_id`); // On cherche un <keyBase>_id exact
        if (exactMatch) return {table: keyBase, id: item[exactMatch]};
      }
    }

    if (item.id) return {table: moduleName, id: item.id}; // Cas direct — ID explicite déjà présent

    if (moduleName) {
      const moduleMatch = idKeys.find(k => k === `${moduleName}_id`);
      if (moduleMatch) return {table: moduleName, id: item[moduleMatch]};
    }

    return {table: moduleName, id: item[idKeys[0]]}; // Sinon : dernier recours → le premier *_id trouvé
  }

  function resolvePrimaryId(item, moduleName) {
    if (item.id) return item.id;

    const idKeys = Object.keys(item).filter(k => k.endsWith('_id'));
    if (idKeys.length === 0) return null;

    const singularKey = `${moduleName}_id`;
    const pluralKey = `${moduleName}s_id`;

    if (idKeys.includes(singularKey)) return item[singularKey];
    if (idKeys.includes(pluralKey)) return item[pluralKey];

    // Dernier recours : on prend le premier *_id trouvé
    return item[idKeys[0]];
  }

  // === Création ===
    const handleCreateClick = () => {
      // on recupere et on trie pour garder que se que l on veux \\
      if (items.length === 0) {
        alert("Impossible de créer un élément : aucun modèle de données détecté.");
        return;
      }
        const template = { ...items[0] };
        delete template.id; // remove Id \\
        if (template[`${moduleName}_id`]) delete template[`${moduleName}_id`];
        if (template[`${moduleName}s_id`]) delete template[`${moduleName}s_id`];

        const relatedIds = Object.keys(template) // Déterminer les entités liées
          .filter(key => key.endsWith("_id")) // if (template[`${moduleName}_id`]) delete template[`${moduleName}_id`];
          .map(key => key.replace(/_id$/, "")); // ex: product_id → product

        const newItem = Object.fromEntries(
          Object.keys(template)
            .filter(k => !relatedIds.some(prefix => {
                return k.startsWith(prefix + "_") && k !== `${prefix}_id` && k !== "created" && k !== "updated"; // Supprimer les sous-champs (ex: product_name), mais garder product_id
              }) && !k.includes("created") && !k.includes("updated")
            ).map(k => {
              const newKey = k.startsWith(`${moduleName}_`) ? k.slice(moduleName.length + 1) : k.startsWith(`${moduleName}s_`) ? k.slice(moduleName.length + 2) : k;
              return [newKey, ""];
            })
        );

        setNewItem(newItem);
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
    };

    const handleConfirmCreate = async () => {
        // Validation
        for (const [key, value] of Object.entries(newItem)) {
          console.log(key);
          console.log(value);
          if (!value) {
            alert(`Le champ "${key}" est obligatoire.`);
            return;
          }
        }
    
        try {
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
          <span>Search Element</span>
        </div>
        <button className="createButton" id="createButton" onClick={handleCreateClick}>Create</button>
      </div>
      {filteredItems.length === 0 && <div>Aucun élément trouvé</div>}
      {filteredItems.map((item, idx) => (
        <div key={item.id || idx} className={`module-row ${idx % 2 === 0 ? "even" : "odd"}`}>
          <div className="item-content">
            {Object.entries(item).map(([key, value]) => {
              const rowId =  resolvePrimaryId(item, moduleName);
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
            {/* <button className="btn-edit" onClick={() => startEditing(item.id, null, null)}>Modifier</button> */}
            <button className="btn-delete" onClick={() => handleDelete(item)}>Supprimer</button>
          </div>
        </div>
      ))}

      {/* Popup simple */}
      {editing && editing.key && (
        <div className="edit-popup">
          <h4>Modifier {editing.key}</h4>
          <textarea value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} rows={4}/>
          <div className = "button-popup" style={{ marginTop: 8 }}>
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
              {Object.entries(newItem).map(([key, value]) => (
                <div key={key} className="popup-field">
                    <label>{key}</label>
                  {/* On definie les type delement id = select box ... */}
                  {key.endsWith("_id") ? (
                    <select value={value} onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })}>
                      <option value="">-- Sélectionner --</option>
                      {(selectOptions[key] || []).map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name || `#${opt.id}`}
                        </option>
                      ))}
                    </select>
                  ) : key.toLowerCase().includes("salary") ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="number" step="0.01" placeholder="Min"
                        id={"json:" + key + "_min"}
                        value={value?.min_salary || ""}
                        onChange={(e) =>
                          setNewItem({...newItem, [key]: { ...value, min_salary: parseFloat(e.target.value) || "" },})
                        }
                        style={{ width: "100px" }}
                      />
                      <span>-</span>
                      <input type="number" step="0.01" placeholder="Max" 
                        id={"json:" + key + "_max"} 
                        value={value?.max_salary || ""} 
                        onChange={(e) =>
                          setNewItem({...newItem, [key]: { ...value, max_salary: parseFloat(e.target.value) || "" },})
                        }
                        style={{ width: "100px" }}
                      />
                    </div>
                  ) : key === "collect_application" ? (
                    <input
                      type="checkbox"
                      checked={value !== false} // true par def
                      onChange={(e) =>
                        setNewItem({ ...newItem, [key]: e.target.checked })
                      }
                    />
                  ) : key === "type" ? (
                    <select value={value} onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })}>
                      <option value="">-- Sélectionner --</option>
                      <option value="cdi">cdi</option>
                      <option value="cdd">cdd</option>
                      <option value="alternance">alternance</option>
                      <option value="mi-temps">mi-temps</option>
                      <option value="freelance">freelance</option>
                      <option value="stage">stage</option>
                      <option value="benevolat">benevolat</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })}
                    />
                  )}

                </div>
              ))}
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