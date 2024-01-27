require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const asyncWrapper = require("../middleware/asyncWrapper");
const lunarEclipses = require("../../public/lunar_eclipses.json");
const meteorShowers = require("../../public/meteor_showers.json");

//NASA API.
//documentation for url1 https://ssd-api.jpl.nasa.gov/doc/cad.html
//documentation for url2 https://ssd-api.jpl.nasa.gov/doc/sbdb.html
//for comets I choose the distance = 1 au (it is the distance from Earth to Sun)
const getCometsData = asyncWrapper(async (req, res) => {
  let year = Number(req.params.year) || new Date().getFullYear();
  let cometsData = [];
  let des = "";
  let fullName = "";
  let image = "";
  const url1 = `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${year}-01-01&date-max=${
    year + 1
  }-01-01&dist-max=1&comet=true&diameter=true&fullname=true&neo=false`;
  console.log(url1);
  const options = {
    method: "GET"
  };
  try {
    const response = await fetch(url1, options);
    if (!response) {
      throw new BadRequestError("Invalid response from API cad");
    }
    const data = await response.json();
    for (let i of data.data) {
      console.log(i);
      des = i[0];
      fullName = i[13].trim();
      let url2 = `https://ssd-api.jpl.nasa.gov/sbdb.api?des=${des}&phys-par=true`;
      let urlimage = `https://images-api.nasa.gov/search?q=comet&description=${fullName}&media_type=image`;
      console.log(url2);
      try {
        // console.log(url2);
        const response2 = await fetch(url2, options);
        if (!response2) {
          throw new BadRequestError("Invalid response from API sbdb");
        }
        const data2 = await response2.json();
        // console.log(data2);
        let cometData = {
          des: i[0],
          orbit_id: i[1],
          jd: i[2],
          cd: i[3],
          dist: i[4],
          dist_min: i[5],
          dist_max: i[6],
          v_rel: i[7],
          v_inf: i[8],
          t_sigma_f: i[9],
          h: i[10],
          diameter: i[11],
          diameter_sigma: i[12],
          fullname: i[13].trim(),
          phys_par_name: data2?.phys_par[0]?.name,
          phys_par_desc: data2?.phys_par[0]?.desc,
          phys_par_value: data2?.phys_par[0]?.value,
          phys_par_title: data2?.phys_par[0]?.title,
          orbit_class: data2?.object.orbit_class?.name,
          first_obs: data2?.orbit?.first_obs,
          last_obs: data2?.orbit?.last_obs,
          image: image
        };
        console.log("cometData", cometData.fullname);
        try {
          // console.log("urlimage", urlimage);
          const responseImage = await fetch(urlimage, options);
          if (!responseImage) {
            console.log("no image found");
            image = "";
          }
          const dataImage = await responseImage.json();
          console.log(
            "dataImage",
            dataImage,
            dataImage.collection.items.length
          );
          if (
            dataImage.collection.items.length === 0 ||
            dataImage === undefined
          ) {
            console.log("image", image);
            image = "";
          } else {
            // console.log(
            //   "dataImage",
            //   dataImage.collection.items.map(item => {
            //     console.log(item.data);
            //   })
            // );
            console.log(
              "dataImage2",
              dataImage.collection.items[0]?.links[0]?.href
            );
            cometData.image = dataImage.collection.items[0]?.links[0]?.href;
          }
        } catch (error) {
          console.log(error);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Failed to fetch data from images", error });
        }
        cometsData.push(cometData);
      } catch (error) {
        console.log(error);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to fetch data from sbdb api", error });
      }
    }
    console.log("cometsData", cometsData);
    res.status(StatusCodes.OK).json({ cometsData });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "There is no data with current parameters",
      error
    });
  }
});

//NASA API. For asteroids I choose the distance = 0.0005 au less that 1/4 distance from Earth to Moon (1 au = it is the distance from Earth to Sun, 0.002637 - distance from Earth to Moon)
const getAsteroidsData = asyncWrapper(async (req, res) => {
  let year = Number(req.params.year) || new Date().getFullYear();
  let maxDistance = year >= new Date().getFullYear() ? 0.005 : 0.0005;

  console.log(maxDistance);
  let asteroidsData = [];
  let des = "";
  let image = "";
  const url = `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${year}-01-01&date-max=${
    year + 1
  }-01-01&dist-max=${maxDistance}&nea=true&diameter=true&fullname=true`;
  const options = {
    method: "GET"
  };
  try {
    const response = await fetch(url, options);
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const data = await response.json();
    console.log(data.count);
    if (data.count === 0) {
      throw new NotFoundError("No asteroids data found for this year");
    } else {
      for (let i of data.data) {
        des = i[0];
        let url2 = `https://ssd-api.jpl.nasa.gov/sbdb.api?des=${des}&phys-par=true`;
        fullName = i[13].trim();
        let urlimage = `https://images-api.nasa.gov/search?q=asteroid&description=${fullName}&media_type=image`;
        try {
          console.log(url2);
          const response2 = await fetch(url2, options);
          if (!response2) {
            throw new BadRequestError("Invalid response from sbdb api");
          }
          const data2 = await response2.json();
          // console.log(data2);
          let asteroidData = {
            des: i[0],
            orbit_id: i[1],
            jd: i[2],
            cd: i[3],
            dist: i[4],
            dist_min: i[5],
            dist_max: i[6],
            v_rel: i[7],
            v_inf: i[8],
            t_sigma_f: i[9],
            h: i[10],
            diameter: i[11],
            diameter_sigma: i[12],
            fullname: i[13].trim(),
            phys_par_name: data2?.phys_par[0]?.name,
            phys_par_desc: data2?.phys_par[0]?.desc,
            phys_par_value: data2?.phys_par[0]?.value,
            phys_par_title: data2?.phys_par[0]?.title,
            orbit_class: data2?.object.orbit_class?.name,
            first_obs: data2?.orbit?.first_obs,
            last_obs: data2?.orbit?.last_obs,
            image: image
          };
          try {
            // console.log("urlimage", urlimage);
            const responseImage = await fetch(urlimage, options);
            if (!responseImage) {
              console.log("no image found");
              image = "";
            }
            const dataImage = await responseImage.json();
            // console.log(
            //   "dataImage",
            //   dataImage,
            //   dataImage.collection.items.length
            // );
            if (
              dataImage.collection.items.length === 0 ||
              dataImage === undefined
            ) {
              // console.log("image", image);
              image = "";
            } else {
              // console.log(
              //   "dataImage",
              //   dataImage.collection.items.map(item => {
              //     console.log(item.data);
              //   })
              // );
              // console.log(
              //   "dataImage2",
              //   dataImage.collection.items[0]?.links[0]?.href
              // );
              asteroidData.image =
                dataImage.collection.items[0]?.links[0]?.href;
            }
          } catch (error) {
            console.log(error);
            res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ message: "Failed to fetch data from images", error });
          }
          console.log("asteroidData", asteroidData);
          asteroidsData.push(asteroidData);
        } catch (error) {
          console.log("error", error);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Failed to fetch data from sbdb api", error });
        }
      }
    }
    console.log("asteroidsData", asteroidsData);
    console.log(asteroidsData);
    res.status(StatusCodes.OK).json({ asteroidsData });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "There is no data with current parameters",
      error
    });
  }
});

// information comes from aa.usno.navy.mil/api/eclipses/solar/year?year=YEAR
const getSolarEclipsesData = asyncWrapper(async (req, res) => {
  console.log(req.params.year);
  let year = Number(req.params.year) || new Date().getFullYear();
  let image = "";
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
    data.eclipses_in_year.map(d => (d.image = image));
    console.log(data);
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch data", error });
  }
});

//information from local storage
const getLunarEclipsesData = (req, res) => {
  console.log(req.params.year);
  let image = "";
  let year = Number(req.params.year) || new Date().getFullYear();
  try {
    const response = lunarEclipses;
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const eclipsesByYear = response.filter(eclipse =>
      eclipse.date.startsWith(year)
    );
    eclipsesByYear.map(eclipse => (eclipse.image = image));
    console.log(eclipsesByYear);
    res.status(StatusCodes.OK).json({ eclipsesByYear });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "There is no data with current parameters", error });
  }
};

const getMeteorShowersData = (req, res) => {
  console.log(req.params.year);
  let image = "";
  let name = "";
  const meteorShowersImgs = [
    "https://images-assets.nasa.gov/image/NHQ202108110001/NHQ202108110001~thumb.jpg",
    "https://images-assets.nasa.gov/image/NHQ202108110003/NHQ202108110003~thumb.jpg",
    "https://images-assets.nasa.gov/image/NHQ202108110005/NHQ202108110005~thumb.jpg",
    "https://images-assets.nasa.gov/image/NHQ202108100009/NHQ202108100009~thumb.jpg",
    "https://images-assets.nasa.gov/image/NHQ202108110002/NHQ202108110002~thumb.jpg"
  ];
  let year = Number(req.params.year) || new Date().getFullYear();
  try {
    const response = meteorShowers;
    console.log(response);
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const showersByYear = response.filter(shower =>
      shower.eventDate.startsWith(year)
    );
    console.log("showersByYear", showersByYear.length);
    if (showersByYear.length === 0) {
      throw new BadRequestError("No meteor showers found for the given year");
    } else {
      showersByYear.map(
        shower =>
          (shower.image =
            meteorShowersImgs[
              Math.floor(Math.random() * meteorShowersImgs.length)
            ])
      );
      console.log(showersByYear);
      res.status(StatusCodes.OK).json({ showersByYear });
    }
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "There is no data with current parameters", error });
  }
};

const getNasaPictureOfTheDay = asyncWrapper(async (req, res) => {
  const NASA_key = process.env.NASA_API_KEY;
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_key}`;
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
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch data", error });
  }
});

module.exports = {
  getCometsData,
  getAsteroidsData,
  getSolarEclipsesData,
  getLunarEclipsesData,
  getMeteorShowersData,
  getNasaPictureOfTheDay
};
