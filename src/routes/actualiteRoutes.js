const express = require("express");

const router = express.Router();
const { uploadImage } = require("../middlewares/uploadMiddleware");
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

router.post("/", verifyToken, uploadImage.single("image"), createActualite);

router.put("/:id", verifyToken, uploadImage.single("image"), updateActualite);

router.delete("/:id", verifyToken, deleteActualite);


module.exports = router;