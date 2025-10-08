import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function JobPages() {
  const location = useLocation();
  const { poste, lieu, contract } = location.state || {};
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("http://localhost/api/user/testreou2")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la requête");
        }
        return res.json();
      })
      .then((data) => {
        setJobs(data); // 👈 Ici on stocke toutes les données dans un state
      })
      .catch((err) => console.error("Erreur :", err));
  }, []);
  return (
    <div>
      <h1>Liste des jobs</h1>
      <ul>
        {jobs.map((job, index) => (
          <li key={index}>
            {jobs.titre} - {jobs.lieu} ({jobs.contrat})
          </li>
        ))}
      </ul>
    </div>
  );
}
export default JobPages;
