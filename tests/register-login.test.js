const request = require("supertest");
const app = require("../src/app");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const url = process.env.MONGO_URI_TEST;
const User = require("../src/models/User");
const registererUserId = new mongoose.Types.ObjectId();
const registeredUser = {
  _id: registererUserId,
  name: "Jane Doe",
  email: "jane@example.com",
  password: "password123",
  confirmPassword: "password123"
};

beforeEach(async () => {
  await mongoose.connect(url);
  await User.deleteOne({ email: registeredUser.email });
  await new User(registeredUser).save();
});

afterEach(async () => {
  await User.deleteOne({ email: registeredUser.email });
  await User.deleteOne({ email: "john@example.com" });
  await mongoose.disconnect();
});

test("test sign up a new user", async () => {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123"
      // });
    })
    .expect(201);
  const user = await User.findOne({ email: "john@example.com" });
  expect(user).not.toBeNull();
  expect(user.password).not.toBe("password123");
  expect(response.body.user.name).toBe("John Doe");
});
test("returns 'Account already exists' message if user exists", async () => {
  await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: registeredUser.name,
      email: registeredUser.email,
      password: registeredUser.password,
      confirmPassword: registeredUser.confirmPassword
      // });
    })
    .then((response) => {
      expect(response.body.message).toBe("Account already exists");
    });
});

test("should login existing user", async () => {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: registeredUser.email,
      password: registeredUser.password
    })
    .expect(200);
  const user = await User.findById(registeredUser._id);
  expect(response.body.user.name).toBe(registeredUser.name);
});

test("returns name when login request is valid", async () => {
  await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: registeredUser.email,
      password: registeredUser.password
    })
    .then((response) => {
      expect(response.body.user.name).toBe("Jane Doe");
    });
});

test("return error when user not registered", async () => {
  await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: "john@example.com",
      password: "password123"
    })
    .then((response) => {
      expect(response.body.err.statusCode).toBe(401);
    });
});
