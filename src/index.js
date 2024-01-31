require("dotenv").config();
const PORT = process.env.PORT;
const app = require("./app");
const connectDB = require("../db/connect");
const url = process.env.MONGO_URI;

const start = async () => {
  try {
    await connectDB(url);
    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};
start();
