const express = require("express");
const router = express.Router();

const {
  getAsteroidsData,
  getCometsData,
  getSolarEclipsesData,
  getLunarEclipsesData,
  getMeteorShowersData
} = require("../controllers/APIdata");
router.route("/comets/:year").get(getCometsData);
router.route("/asteroids/:year").get(getAsteroidsData);
router.route("/solarEclipses/:year").get(getSolarEclipsesData);
router.route("/lunarEclipses/:year").get(getLunarEclipsesData);
router.route("/meteorShowers/:year").get(getMeteorShowersData);

module.exports = router;
