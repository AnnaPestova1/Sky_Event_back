require("express-async-errors");
require("dotenv").config();

const express = require("express");
const app = express();
//extra security
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

//swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("swagger.yaml");

const session = require("express-session");
const cookieParser = require("cookie-parser");

const MongoDBStore = require("connect-mongodb-session")(session);

// routes
const authRouter = require("./routes/auth");
const dataRouter = require("./routes/data");
const apiDataRouter = require("./routes/apiData");
const apiNASAImg = require("./routes/apiNASAImg.js");

// middleware
const auth = require("./middleware/authMiddleware.js");

// error handler
const notFoundMiddleware = require("./middleware/not-found.js");
const errorHandlerMiddleware = require("./middleware/error-handler");

const url = process.env.MONGO_URI;
const secret = process.env.SESSION_SECRET;

const store = new MongoDBStore({
  uri: url,
  collection: "mySessions"
});
store.on("error", (error) => {
  console.log(error);
});

const sessionParms = {
  secret: secret,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" }
};

app.use(
  cors([
    {
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      origin: "https://annapestova.onrender.com"
    },
    {
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      origin: "http://localhost:5175"
    }
  ])
);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 min
    max: 100 //limit each IP to 100 requests per windowMs
  })
);

app.use(helmet());
app.use(xss());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(cookieParser());
app.use(session(sessionParms));

//swagger docs
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
//using routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/data", auth, dataRouter);
app.use("/api/v1/apiData", auth, apiDataRouter);
app.use("/api/v1/apiImg", apiNASAImg);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
