const express = require("express");

const router = express.Router();

const {
    getAllMessages,
    getMessageById,
    createMessage,
    updateMessageStatut,
    deleteMessage
} = require("../controllers/messageController");
const { verify } = require("jsonwebtoken");


// Récupérer tous les messages
router.get("/", getAllMessages);


// Récupérer un message par son ID
router.get("/:id", getMessageById);


// Envoyer un nouveau message
router.post("/", createMessage);


// Modifier le statut d'un message
router.put("/:id/statut", updateMessageStatut);


// Supprimer un message
router.delete("/:id", deleteMessage);


// Exporter le routeur
module.exports = router;