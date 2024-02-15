const { StatusCodes } = require("http-status-codes");
const multer = require("multer");

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.StatusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong, please try again later"
  };
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      customError.message =
        "Max file size exceeded. File size must be less than 2 Mb";
      customError.statusCode = StatusCodes.BAD_REQUEST;
    } else {
      customError.message = err.message;
      customError.statusCode = StatusCodes.BAD_REQUEST;
    }
  }
  if (err.name === "ValidationError") {
    customError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === "CastError") {
    customError.message = `No item was found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  return res
    .status(customError.statusCode)
    .json({ message: customError.message, err });
};

module.exports = errorHandlerMiddleware;
