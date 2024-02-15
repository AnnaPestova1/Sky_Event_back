const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const dotenv = require("dotenv");
dotenv.config();
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

//get info from google about user
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
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("error", error);
    throw new UnauthenticatedError("Invalid credentials");
  }
}

//Google OAuth
const googleOauth = async (req, res) => {
  const code = req.query.code;
  try {
    let redirectURL = process.env.REDIRECT_URI;
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectURL
    );
    const r = await oAuth2Client.getToken(code);
    // Make sure to set the credentials on the OAuth2 client.
    await oAuth2Client.setCredentials(r.tokens);
    const credentials = oAuth2Client.credentials;
    const userData = await getUserData(
      credentials.access_token,
      credentials.id_token
    );
    //check if Google verified the email before provide information from database
    if (!userData.email_verified) {
      throw new UnauthenticatedError("Google credentials error");
    }
    //sub - user identifier from google using here instead of password
    const { email, name, sub } = userData;
    //login existing user
    const googleUser = await User.findOne({ email });
    //check if user registered using login and password
    // if (googleUser.authProvider === false) {
    //   throw new UnauthenticatedError("Try logging in with email and password.");
    // }
    if (!googleUser) {
      //create new user
      const newUser = await User.create({
        name,
        email,
        password: sub,
        //authProvider allows to know that the user is registered using google
        authProvider: true
      });
      const token = newUser.createJWT();
      const redirectURL = `${process.env.REDIRECT_OAUTH_URI}?name=${newUser.name}&token=${token}`;
      res.redirect(redirectURL);
    }
    if (googleUser.authProvider === false) {
      throw new UnauthenticatedError("Try logging in with email and password.");
    }
    const isPasswordCorrect = await googleUser.comparePassword(sub);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid credentials");
    }
    const token = googleUser.createJWT();
    redirectURL = `${process.env.REDIRECT_OAUTH_URI}?name=${googleUser.name}&token=${token}`;
    res.redirect(redirectURL);
  } catch (err) {
    console.log("Error logging in with OAuth2 user", err);
    const redirectURLwithError = `${process.env.REDIRECT_OAUTH_URI}?error=${err}`;
    res.redirect(redirectURLwithError);
  }
};

module.exports = {
  register,
  login,
  logout,
  googleOauth
};
