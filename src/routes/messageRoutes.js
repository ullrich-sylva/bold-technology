const express = require("express");

const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");

const {
    getAllMessages,
    getMessageById,
    createMessage,
    updateMessageStatut,
    deleteMessage
} = require("../controllers/messageController");


// Envoyer un nouveau message (public — formulaire de contact)
router.post("/", createMessage);


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