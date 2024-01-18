const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const asyncWrapper = require("../middleware/asyncWrapper");
const lunarEclipses = require("../../public/lunar_eclipses.json");
const meteorShowers = require("../../public/meteor_showers.json");

//NASA API.
//for comets I choose the distance = 1 au (it is the distance from Earth to Sun)
const getCometsData = asyncWrapper(async (req, res) => {
  let year = Number(req.params.year) || new Date().getFullYear();
  const url = `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${year}-01-01&date-max=${
    year + 1
  }-01-01&dist-max=1&comet=true&diameter=true&fullname=true&neo=false`;
  const options = {
    method: "GET"
  };
  try {
    const response = await fetch(url, options);
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const data = await response.json();
    console.log(data);
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Failed to fetch data");
  }
});

//NASA API. For asteroids I choose the distance = 0.01 au (1 au = it is the distance from Earth to Sun)
const getAsteroidsData = asyncWrapper(async (req, res) => {
  let year = Number(req.params.year) || new Date().getFullYear();
  const url = `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${year}-01-01&date-max=${
    year + 1
  }-01-01&dist-max=0.01&nea=true&diameter=true&fullname=true`;
  const options = {
    method: "GET"
  };
  try {
    const response = await fetch(url, options);
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const data = await response.json();
    console.log(data);
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Failed to fetch data");
  }
});

// information comes from aa.usno.navy.mil/api/eclipses/solar/year?year=YEAR
const getSolarEclipsesData = asyncWrapper(async (req, res) => {
  console.log(req.params.year);
  let year = Number(req.params.year) || new Date().getFullYear();
  const url = `https://aa.usno.navy.mil/api/eclipses/solar/year?year=${year}`;
  const options = {
    method: "GET"
  };
  try {
    const response = await fetch(url, options);
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const data = await response.json();
    console.log(data);
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Failed to fetch data");
  }
});

//information from local storage
const getLunarEclipsesData = (req, res) => {
  console.log(req.params.year);
  let year = Number(req.params.year) || new Date().getFullYear();
  try {
    const response = lunarEclipses;
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const eclipsesByYear = response.filter(eclipse =>
      eclipse.date.startsWith(year)
    );
    res.status(StatusCodes.OK).json({ eclipsesByYear });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Failed to fetch data");
  }
};

const getMeteorShowersData = (req, res) => {
  console.log(req.params.year);
  let year = Number(req.params.year) || new Date().getFullYear();
  try {
    const response = meteorShowers;
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const showersByYear = response.filter(shower =>
      shower.eventDate.startsWith(year)
    );
    res.status(StatusCodes.OK).json({ showersByYear });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Failed to fetch data");
  }
};

module.exports = {
  getCometsData,
  getAsteroidsData,
  getSolarEclipsesData,
  getLunarEclipsesData,
  getMeteorShowersData
};
