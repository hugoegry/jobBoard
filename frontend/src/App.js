import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./component/header";
import Footer from "./component/footer";
import Accueil from "./pages/accueil";
import JobPages from "./pages/JobPages"; // ✅ ta deuxième page

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* 🏠 Page d'accueil */}
        <Route path="/" element={<Accueil />} />

        {/* 💼 Page des résultats */}
        <Route path="/jobs" element={<JobPages />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
