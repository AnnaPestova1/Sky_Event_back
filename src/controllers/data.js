const Data = require("../models/Data");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllData = async (req, res) => {
  const items_per_page = 12;
  let { page, filtering } = req.query;
  if (!page) page = 1;
  const skip = (page - 1) * items_per_page;

  let data = await Data.find({ createdBy: req.user.userId });
  let filteredData = await Data.find({ createdBy: req.user.userId })
    .sort("date")
    .skip(skip)
    .limit(items_per_page);

  if (filtering) {
    data = await Data.find({ createdBy: req.user.userId }).where({
      event: filtering
    });
    filteredData = await Data.find({ createdBy: req.user.userId })
      .sort("date")
      .skip(skip)
      .limit(items_per_page)
      .where({ event: filtering });
  }
  // console.log(filteredData, filtering);
  res.status(StatusCodes.OK).json({
    data: filteredData,
    count: filteredData.length,
    totalCount: Math.ceil(data.length / items_per_page)
  });
};

const getData = async (req, res) => {
  const {
    user: { userId },
    params: { id: dataId }
  } = req;
  const data = await Data.findOne({
    _id: dataId,
    createdBy: userId
  });
  if (!data) {
    throw new NotFoundError(`No job with id ${dataId}`);
  }
  res.status(StatusCodes.OK).json({ data });
};

const createData = async (req, res) => {
  const {
    body: { event, name }
  } = req;
  req.body.createdBy = req.user.userId;
  if (event === "" || name === "") {
    throw new BadRequestError("Event or Name fields cannot be empty.");
  }
  const data = await Data.create(req.body);
  res.status(StatusCodes.CREATED).json({ data });
};

const updateData = async (req, res) => {
  const {
    body: { event, name },
    user: { userId },
    params: { id: dataId }
  } = req;
  if (event === "" || name === "") {
    throw new BadRequestError("Event or Name fields cannot be empty");
  }
  const data = await Data.findByIdAndUpdate(
    {
      _id: dataId,
      createdBy: userId
    },
    req.body,
    { new: true, runValidators: true }
  );
  if (!data) {
    throw new NotFoundError(`No job with id ${dataId}`);
  }
  res.status(StatusCodes.OK).json({ data });
};

const deleteData = async (req, res) => {
  const {
    user: { userId },
    params: { id: dataId }
  } = req;
  const data = await Data.findOneAndDelete({
    _id: dataId,
    createdBy: userId
  });
  if (!data) {
    throw new NotFoundError(`No job with id ${dataId}`);
  }
  res.status(StatusCodes.OK).json({ message: "The entry was deleted." });
};

module.exports = {
  getAllData,
  getData,
  createData,
  updateData,
  deleteData
};
