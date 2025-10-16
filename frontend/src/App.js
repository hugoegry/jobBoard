import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./component/header";
import Footer from "./component/footer";
import Accueil from "./pages/accueil";
import JobPages from "./pages/JobPages";
import FormConnexion from "./pages/connexion";
import AccountInfo from "./pages/AccountInfo";
import FrmAdmin from "./pages/admin";
import FrmApply from "./pages/apply";
import UserManual from "./pages/UserManual";

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

        <Route path="/MyAccount" element={<AccountInfo />} />

        <Route path="/admin" element={<FrmAdmin />} />
        <Route path="/offre/:offerId" element={<FrmApply />} />
        <Route path="/usermanual" element={<UserManual />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
