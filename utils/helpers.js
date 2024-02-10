// const qs = require("qs");

// const getGoogleOauthToken = async (code) => {
//   const url = `https://oauth2.googleapis.com/token`;
//   const value = {
//     code,
//     client_id: process.env.CLIENT_ID,
//     client_secret: process.env.CLIENT_SECRET,
//     redirect_uri: process.env.REDIRECT_URI,
//     grant_type: "authorization_code"
//   };
//   console.log("value", value);
//   console.log("qs.stringify(value)", qs.stringify(value));
//   const options = {
//     method: "GET"
//   };
//   try {
//     const res = await fetch(url, options, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       }
//     });
//     console.log("res.data", res, res.data);
//     res.data;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };
// module.exports = getGoogleOauthToken;
