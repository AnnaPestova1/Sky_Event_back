const express = require("express");
const router = express.Router();

const { login, register, logout, googleOauth } = require("../controllers/auth");

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/oauth/google", googleOauth);

module.exports = router;
