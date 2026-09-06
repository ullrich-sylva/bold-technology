require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const db = require("./config/database");
const realisationRoutes = require("./routes/realisationRoutes");
const actualiteRoutes = require("./routes/actualiteRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/realisations", realisationRoutes);
app.use("/api/actualites", actualiteRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route de test
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur l'API BOLD TECHNOLOGY"
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});


