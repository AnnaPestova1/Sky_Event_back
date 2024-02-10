const Data = require("../models/Data");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

//get saved data from MongoDB
const getAllData = async (req, res) => {
  //set quantity for pagination
  const items_per_page = 12;
  let { page, filtering } = req.query;
  if (!page) page = 1;
  const skip = (page - 1) * items_per_page;
  //find data created by registered user
  let data = await Data.find({ createdBy: req.user.userId });
  //filtering data
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
  res.status(StatusCodes.OK).json({
    data: filteredData,
    count: filteredData.length,
    //rounded number of pages to show in pagination on Front End
    totalCount: Math.ceil(data.length / items_per_page)
  });
};

//get single data from database
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

//create new data
const createData = async (req, res) => {
  const {
    body: { event, name }
  } = req;
  req.body.createdBy = req.user.userId;
  // save user's image to database
  if (req.file) {
    //convert file to string to store in database
    req.body.eventImage = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;
  }
  if (event === "" || name === "") {
    throw new BadRequestError("Event or Name fields cannot be empty.");
  }
  const data = await Data.create(req.body);
  res.status(StatusCodes.CREATED).json({ data });
};

//update data
const updateData = async (req, res) => {
  const {
    body: { event, name },
    user: { userId },
    params: { id: dataId }
  } = req;
  // save user's image to database
  if (req.file) {
    //convert file to string to store in database
    req.body.eventImage = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;
  }
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

//delete data
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
