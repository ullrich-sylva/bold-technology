const express = require("express");

const router = express.Router();

const { login } = require("../controllers/authController");


// Connexion administrateur
router.post("/login", login);


module.exports = router;