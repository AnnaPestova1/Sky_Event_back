const express = require("express");
const router = express.Router();

const {
  getAllData,
  getData,
  createData,
  updateData,
  deleteData
} = require("../controllers/data");

router.route("/").get(getAllData).post(createData);
router.route("/:id").get(getData).patch(updateData).delete(deleteData);

module.exports = router;
