const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const dotenv = require("dotenv");
dotenv.config();
const getGoogleOauthToken = require("../../utils/helpers");
const { OAuth2Client } = require("google-auth-library");

const register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    throw new BadRequestError("The passwords entered do not match.");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Account already exists");
  }
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

const logout = async (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    } else {
      return res
        .status(StatusCodes.OK)
        .json({ message: "Logged out successfully" });
    }
  });
};

// const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
// const client = new OAuth2Client(GOOGLE_CLIENT_ID);
// async function verifyGoogleToken(token) {
//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: GOOGLE_CLIENT_ID
//     });
//     return { payload: ticket.getPayload() };
//   } catch (error) {
//     return { error: "Invalid user detected. Please try again" };
//   }
// }
async function getUserData(access_token, id_token) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    );
    //console.log('response',response);
    const data = await response.json();

    console.log("data", data);
    return data;
  } catch (error) {
    console.log("error", error);
    throw new UnauthenticatedError("Invalid credentials");
  }
}

const googleOauth = async (req, res) => {
  const code = req.query.code;

  console.log(code);
  try {
    const redirectURL = process.env.REDIRECT_URI;
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectURL
    );
    console.log("oAuth2Client", oAuth2Client);
    const r = await oAuth2Client.getToken(code);
    // Make sure to set the credentials on the OAuth2 client.
    await oAuth2Client.setCredentials(r.tokens);
    console.info("Tokens acquired.");
    const user = oAuth2Client.credentials;
    console.log("credentials", user);
    const userData = await getUserData(
      oAuth2Client.credentials.access_token,
      oAuth2Client.credentials.id_token
    );
    console.log("userData", userData);

    if (!userData.email_verified) {
      throw new UnauthenticatedError("Google credentials error");
    }
    const { email, name, sub } = userData;
    console.log(email, name, sub);
    const googleUser = await User.findOne({ email });
    if (!googleUser) {
      const newUser = await User.create({
        name,
        email,
        password: sub,
        authProvider: true
      });
      const token = newUser.createJWT();
      const redirectURL = `${process.env.REDIRECT_OAUTH_URI}?name=${newUser.name}&token=${token}`;
      res.redirect(redirectURL);
      // res
      //   // .redirect(process.env.REDIRECT_OAUTH_URI)
      //   .status(StatusCodes.CREATED)
      //   .json({ newUser: { name: newUser.name }, token });
    } else {
      if (googleUser.authProvider === false) {
        throw new UnauthenticatedError("The user already exists");
      }
      const isPasswordCorrect = await googleUser.comparePassword(sub);
      if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid credentials");
      }
      const token = googleUser.createJWT();
      const redirectURL = `${process.env.REDIRECT_OAUTH_URI}?name=${googleUser.name}&token=${token}`;
      res.redirect(redirectURL);
      // res
      //   // .redirect(process.env.REDIRECT_OAUTH_URI)
      //   .status(StatusCodes.OK)
      //   .json({ user: { name: googleUser.name }, token });
    }
  } catch (err) {
    console.log("Error logging in with OAuth2 user", err);
    res
      // .redirect(process.env.REDIRECT_NOT_OAUTH_URI)
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed logging in with OAuth2 user", error });
  }
};

//  console.log("req", req);
//   console.log("req.body", req.body);
//   console.log("req.body.token", req.body.token);
//   console.log("req.body.credential", req.body.credential);
//   const token = verifyGoogleToken();
// };
// const getGoogleOauthToken = as ync (code) => {
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
//     const res = await fetch(url, qs.stringify(value), options, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       }
//     });
//     console.log("res.data", res.data);
//     res.data;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const googleOauth = async (req, res) => {
//   // console.log(req);
//   // const code = req.query.code;
//   // const { id_token, access_token } = await getGoogleOauthToken(code);
//   // console.log("tokens", id_token, access_token);
//   const oAuth2Client = await getAuthenticatedClient();
//   // Make a simple request to the People API using our pre-authenticated client. The `request()` method
//   // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
//   // const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
//   const url = "https://oauth2.googleapis.com/token";
//   const response = await oAuth2Client.request({ url });
//   console.log("response.data", response.data);

//   // After acquiring an access_token, you may want to check on the audience, expiration,
//   // or original scopes requested.  You can do that with the `getTokenInfo` method.
//   const tokenInfo = await oAuth2Client.getTokenInfo(
//     oAuth2Client.credentials.access_token
//   );
//   console.log("tokenInfo", tokenInfo);
// };
// };
module.exports = {
  register,
  login,
  logout,
  googleOauth
};
