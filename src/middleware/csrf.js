// app.use(cookieParser(process.env.SESSION_SECRET));
// app.use(express.urlencoded({ extended: false }));
// let csrf_development_mode = true;
// if (app.get("env") === "production") {
//   csrf_development_mode = false;
//   app.set("trust proxy", 1);
// }
// const csrf_options = {
//   protected_operations: ["PATCH"],
//   protected_content_types: ["application/json"],
//   development_mode: csrf_development_mode
// };

// app.use((req, res, next) => {
//   csrf(csrf_options);
//   console.log("res.locals._csrf", res.locals._csrf);
//   next();
// });
// app.use(csrf(csrf_options));
// var csrfProtect = csrf({ cookie: true });
// app.get("/csrf-token", csrfProtect, function (req, res) {
//   debugger;
//   // Generate a tocken and send it to the view
//   res.render("send", { csrfToken: req.csrfToken() });
// });
// app.use((req, res, next) => {
//   debugger;
//   // res.locals.csrfToken = req.csrfToken();
//   res.locals.csrfToken = req.csrfToken;
//   console.log(res.locals.csrfToken);
//   next();
// });
// module.exports = app;
