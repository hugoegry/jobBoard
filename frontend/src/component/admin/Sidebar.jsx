import React from "react";

export default function Sidebar({ modules, active, onChange }) {
  return (
    <div>
      {modules.map((m) => (
        <div key={m} className={`module-item ${active === m ? "active" : ""}`} onClick={() => onChange(m)}>
          {m}
        </div>
      ))}
    </div>
  );
}
