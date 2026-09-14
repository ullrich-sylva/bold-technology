const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const { login } = require("../controllers/authController");


// Limite les tentatives de connexion pour se protéger du bruteforce
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 tentatives max par IP dans la fenêtre
    message: { error: "Trop de tentatives, réessayez plus tard." }
});


// Connexion administrateur
router.post("/login", loginLimiter, login);


module.exports = router;