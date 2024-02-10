const multer = require("multer");
const { BadRequestError, NotFoundError } = require("../errors");
const sharp = require("sharp");
// require("dotenv").config();
// const { GridFsStorage } = require("multer-gridfs-storage");
// const Grid = require("gridfs-stream");
// const url = process.env.MONGO_URI;
// const mongoose = require("mongoose");

// const conn = mongoose.createConnection(url);
// const gfs = Grid(conn.db, mongoose.mongo);

// conn.once("open", () => {
//   gfs.collection("uploads");
// });

// const storage = new GridFsStorage({
//   url: url,
//   file: (req, file) => {
//     if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       const fileName = `${Date.now()}-${file.originalname}`;
//       return {
//         filename: fileName,
//         bucketName: "uploads"
//       };
//     } else {
//       new BadRequestError(
//         "The file you trying to upload not an image! Only .png, .jpg and .jpeg format allowed!"
//       ),
//         false;
//     }
//   }
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/temp/images");
//   },
//   filename: (req, file, cb) => {
//     const fileName = file.originalname;
//     cb(null, fileName);
//   }
// });
const fileFilter = (req, file, cb) => {
  if (
    //   file.mimetype === "image/png" ||
    //   file.mimetype === "image/jpg" ||
    //   file.mimetype === "image/jpeg"
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

const limits = {
  fileSize: 1028 * 1028 * 2
};
const upload = multer({ fileFilter, limits }).single("eventImage");
// const upload = multer({ storage, limits }).single("eventImage");
// storage: multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "/images");
//   },
//   filename: (req, file, cb) => {
//     const fileName = `${Date.now()}-${file.originalname}`;
//     cb(null, fileName);
//   }
// }),
//up to 2mb
// limits: {
//   fileSize: 1028 * 1028 * 2
// }
// fileFilter(req, file, cb) {
//   if (
//     //   file.mimetype === "image/png" ||
//     //   file.mimetype === "image/jpg" ||
//     //   file.mimetype === "image/jpeg"
//     file.originalname.match(/\.(jpg|jpeg|png)$/)
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
//   }
// }
// })

module.exports = upload;
