const express = require("express");

const router = express.Router();
const rateLimit = require("express-rate-limit");
const verifyToken = require("../middlewares/authMiddleware");

const {
    getAllMessages,
    getMessageById,
    createMessage,
    updateMessageStatut,
    deleteMessage
} = require("../controllers/messageController");


// Limite le formulaire de contact public : 5 messages max par IP par heure
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: "Trop de messages envoyés, réessayez plus tard." }
});


// Envoyer un nouveau message (public — formulaire de contact)
router.post("/", contactLimiter, createMessage);


// Récupérer tous les messages (admin uniquement)
router.get("/", verifyToken, getAllMessages);


// Récupérer un message par son ID (admin uniquement)
router.get("/:id", verifyToken, getMessageById);


// Modifier le statut d'un message (admin uniquement)
router.put("/:id/statut", verifyToken, updateMessageStatut);


// Supprimer un message (admin uniquement)
router.delete("/:id", verifyToken, deleteMessage);


// Exporter le routeur
module.exports = router;