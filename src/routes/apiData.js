const express = require("express");
const router = express.Router();

const { getSolarEclipsesData } = require("../controllers/apiData");

router.route("/solarEclipses").get(getSolarEclipsesData);

module.exports = router;
