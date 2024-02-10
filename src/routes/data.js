const express = require("express");
const router = express.Router();
const upload = require("../middleware/imageMiddleware");

const {
  getAllData,
  getData,
  createData,
  updateData,
  deleteData
} = require("../controllers/data");

router.route("/").get(getAllData).post(upload, createData);
router.route("/:id").get(getData).patch(upload, updateData).delete(deleteData);

module.exports = router;
