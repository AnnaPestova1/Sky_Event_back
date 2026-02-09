const mongoose = require("mongoose");

const connectDB = (url) => {
  console.log("Connecting to MongoDB...", url);
  return mongoose.connect(url);
};

module.exports = connectDB;
