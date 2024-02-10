const multer = require("multer");
const { BadRequestError } = require("../errors");

const fileFilter = (req, file, cb) => {
  if (
    //check if file have particular formats
    file.originalname.match(/\.(jpg|jpeg|png)$/)
  ) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        "The file you trying to upload not an image! Only .png, .jpg and .jpeg format allowed!"
      ),
      false
    );
  }
};
//max 2 mb
const limits = {
  fileSize: 1028 * 1028 * 2
};
const upload = multer({ fileFilter, limits }).single("eventImage");
module.exports = upload;
