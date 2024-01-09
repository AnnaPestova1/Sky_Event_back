const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const asyncWrapper = require("../middleware/asyncWrapper");

// const getMeteorShowerData = async (req, res) => {
//   const data = await Data.find({ createdBy: req.user.userId }).sort(
//     "createdAt"
//   );
//   debugger;
//   res.status(StatusCodes.OK).json({ data, count: data.length });
// };
const getSolarEclipsesData = asyncWrapper(async (req, res) => {
  let year = req.query.year || new Date().getFullYear();
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
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Failed to fetch data");
  }
});

//aa.usno.navy.mil/api/eclipses/solar/year?year=YEAR
module.exports = {
  //   getMeteorShowerData,
  getSolarEclipsesData
};
