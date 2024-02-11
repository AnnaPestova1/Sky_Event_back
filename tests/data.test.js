const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const url = process.env.MONGO_URI_TEST;
const User = require("../src/models/User");
const Data = require("../src/models/Data");

let year = 2026;
const registererUserId = new mongoose.Types.ObjectId();
let dataId = "";
const registeredUser = {
  _id: registererUserId,
  name: "Jane Doe",
  email: "jane2@example.com",
  password: "password123",
  confirmPassword: "password123",
  token: jwt.sign({ userId: registererUserId }, process.env.JWT_SECRET)
};

const data = {
  event: "comet",
  name: "62P/Tsuchinshan 1",
  date: "2024-01-30T04:17:00.000+00:00",
  description: "Comet 62P/Tsuchinshan 1 is a Jupiter-family Comet. ",
  image: "",
  createdBy: registeredUser._id
};

const bearer = registeredUser.token;

beforeAll(async () => {
  await mongoose.connect(url);
  await User.deleteOne({ email: registeredUser.email });
  await Data.deleteMany();
  await new User(registeredUser).save();
  await new Data(data).save();
});

afterAll(async () => {
  await User.deleteOne({ email: registeredUser.email });
  await Data.deleteMany();
  await mongoose.disconnect();
});

//test CRUD
test("should get data from database", async () => {
  await request(app)
    .get("/api/v1/data")
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      dataId = response.body.data[0]._id;
      expect(response.status).toBe(200);
    });
});

test("should receive validation error than create invalid data", async () => {
  await request(app)
    .post("/api/v1/data")
    .set("Authorization", `Bearer ${bearer}`)
    .send({
      event: "meteor",
      name: "New Meteor",
      date: "2024-02-01T12:00:00.000+00:00",
      description: "New meteor data",
      image: ""
    })
    .then((response) => {
      expect(response.body.message).toBe(
        "`meteor` is not a valid enum value for path `event`."
      );
    });
});

test("should create data in the database", async () => {
  await request(app)
    .post("/api/v1/data")
    .set("Authorization", `Bearer ${bearer}`)
    .send({
      event: "asteroid",
      name: "New Asteroid",
      date: "2024-02-01T12:00:00.000+00:00",
      description: "New meteor data",
      image: ""
    })
    .then((response) => {
      expect(response.body.data.name).toBe("New Asteroid");
    });
});
test("should get single data from database", async () => {
  await request(app)
    .get(`/api/v1/data/${dataId}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      expect(response.status).toBe(200);
    });
});

test("should update single data from database", async () => {
  await request(app)
    .patch(`/api/v1/data/${dataId}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send({ ...data, name: "Updated name" })
    .then((response) => {
      expect(response.body.data.name).toBe("Updated name");
    });
});

test("should delete single data from database", async () => {
  await request(app)
    .delete(`/api/v1/data/${dataId}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      expect(response.body.message).toBe("The entry was deleted.");
    });
});

//test NASA API
//picture of the day
test("returns 200 OK when receive Nasa Picture of the day from Nasa API", (done) => {
  request(app)
    .get("/api/v1/apiImg/NASAPictureOfTheDay")
    .send()
    .then((response) => {
      expect(response.status).toBe(200);
      done();
    });
});

//test events
test("returns 200 OK when receive comets", async () => {
  await request(app)
    .get(`/api/v1/apiData/comets/${year}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      expect(response.status).toBe(200);
    });
});
test("returns 200 OK when receive asteroids", async () => {
  await request(app)
    .get(`/api/v1/apiData/asteroids/${year}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      expect(response.status).toBe(200);
    });
});

test("returns 200 OK when receive meteor showers", async () => {
  await request(app)
    .get(`/api/v1/apiData/meteorShowers/${year}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      expect(response.status).toBe(200);
    });
});

test("returns 200 OK when receive solar eclipses", async () => {
  await request(app)
    .get(`/api/v1/apiData/solarEclipses/${year}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      expect(response.status).toBe(200);
    });
});

test("returns 200 OK when receive lunar eclipses", async () => {
  await request(app)
    .get(`/api/v1/apiData/lunarEclipses/${year}`)
    .set("Authorization", `Bearer ${bearer}`)
    .send()
    .then((response) => {
      expect(response.status).toBe(200);
    });
});
