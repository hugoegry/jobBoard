const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80;

// Servir le frontend build
app.use(express.static(path.join(__dirname, "public")));

// Route API de test
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Toutes les autres routes → frontend React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
