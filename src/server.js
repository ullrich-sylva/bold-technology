require("dotenv").config();

const validateEnv = require("./utils/validateEnv");
validateEnv(); // Arrête le process si une variable .env critique manque

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

const realisationRoutes = require("./routes/realisationRoutes");
const actualiteRoutes = require("./routes/actualiteRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");
const { notFoundHandler, errorHandler } = require("./middlewares/errorMiddleware");

// Middlewares globaux — toujours avant les routes
app.use(helmet());
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5500", // Live Server VS Code
        "http://localhost:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/realisations", realisationRoutes);
app.use("/api/actualites", actualiteRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Route de test
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur l'API BOLD TECHNOLOGY"
    });
});

// Gestion des erreurs — toujours en dernier, dans cet ordre précis
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});