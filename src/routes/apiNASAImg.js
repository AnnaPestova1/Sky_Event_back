const express = require("express");
const router = express.Router();
const { getNasaPictureOfTheDay } = require("../controllers/apiData");

router.route("/NASAPictureOfTheDay").get(getNasaPictureOfTheDay);

module.exports = router;
