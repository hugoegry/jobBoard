import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./component/header";
import Footer from "./component/footer";
import Accueil from "./pages/accueil";
import JobPages from "./pages/JobPages"; // ✅ ta deuxième page
import FormConnexion from "./pages/connexion";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* 🏠 Page d'accueil */}
        <Route path="/" element={<Accueil />} />

        {/* 💼 Page des résultats */}
        <Route path="/jobs" element={<JobPages />} />
        {/* 🧑‍💻 Page Connexion*/}
        <Route path="/connexion" element={<FormConnexion />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
