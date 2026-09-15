const express = require("express");

const router = express.Router();
const { uploadImage, verifyRealFileType } = require("../middlewares/uploadMiddleware");
const verifyToken = require("../middlewares/authMiddleware");


const {
    getAllActualites,
    getActualiteById,
    createActualite,
    updateActualite,
    deleteActualite
} = require("../controllers/actualiteController");


router.get("/", getAllActualites);

router.get("/:id", getActualiteById);

// Upload image + vérification magic bytes avant d'appeler le controller
router.post("/", verifyToken, uploadImage.single("image"), verifyRealFileType, createActualite);

router.put("/:id", verifyToken, uploadImage.single("image"), verifyRealFileType, updateActualite);

router.delete("/:id", verifyToken, deleteActualite);


module.exports = router;
