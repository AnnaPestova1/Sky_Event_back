require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const asyncWrapper = require("../middleware/asyncWrapper");
const lunarEclipses = require("../../public/lunar_eclipses.json");
const meteorShowers = require("../../public/meteor_showers.json");

//NASA API.
//documentation for url1 https://ssd-api.jpl.nasa.gov/doc/cad.html
//documentation for url2 https://ssd-api.jpl.nasa.gov/doc/sbdb.html
//for comets choose distance is = 1 au (it is the distance from Earth to Sun)
const getCometsData = asyncWrapper(async (req, res) => {
  let year = Number(req.params.year) || new Date().getFullYear();
  let cometsData = [];
  let des = "";
  let fullName = "";
  let image = "";
  //receive data for full year
  const url1 = `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${year}-01-01&date-max=${
    year + 1
  }-01-01&dist-max=1&comet=true&diameter=true&fullname=true&neo=false`;
  const options = {
    method: "GET"
  };
  try {
    const response = await fetch(url1, options);
    if (!response) {
      throw new BadRequestError("Invalid response from API cad");
    }
    //API response processing and converting
    const data = await response.json();
    for (let i of data.data) {
      des = i[0];
      fullName = i[13].trim();
      let url2 = `https://ssd-api.jpl.nasa.gov/sbdb.api?des=${des}&phys-par=true`;
      let urlimage = `https://images-api.nasa.gov/search?q=comet&description=${fullName}&media_type=image`;
      try {
        // receive physical characteristics of particular comet to find the information about magnitude
        //and other characteristics to create description of comet
        const response2 = await fetch(url2, options);
        if (!response2) {
          throw new BadRequestError("Invalid response from API sbdb");
        }
        const data2 = await response2.json();
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
        try {
          //trying to find image of particular comet
          const responseImage = await fetch(urlimage, options);
          //handle lack of images
          if (!responseImage) {
            image = "";
          }
          const dataImage = await responseImage.json();
          if (
            dataImage.collection.items.length === 0 ||
            dataImage === undefined
          ) {
            image = "";
          } else {
            //save first image from the list of images received from NASA API
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
    res.status(StatusCodes.OK).json({ cometsData });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "There is no data with current parameters",
      error
    });
  }
});

//NASA API. For asteroids choose different distances, because of how they are registered in API.
//For past years distance = 0.0005 au - its less that 1/4 distance
// from Earth to Moon (1 au = it is the distance from Earth to Sun,
//0.002637 - distance from Earth to Moon). for future years distance 0.005 au,
//for current year - 0.001 au

const getAsteroidsData = asyncWrapper(async (req, res) => {
  let year = Number(req.params.year) || new Date().getFullYear();
  //distance vary
  let maxDistance =
    year > new Date().getFullYear()
      ? 0.005
      : year < new Date().getFullYear()
        ? 0.0005
        : 0.001;
  let asteroidsData = [];
  let des = "";
  let image = "";
  //receive data for full year
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
    if (data.count === 0) {
      throw new NotFoundError("No asteroids data found for this year");
    } else {
      // receive physical characteristics of particular asteroid to find the information about magnitude
      //and other characteristics to create description of asteroid
      for (let i of data.data) {
        des = i[0];
        let url2 = `https://ssd-api.jpl.nasa.gov/sbdb.api?des=${des}&phys-par=true`;
        fullName = i[13].trim();
        let urlimage = `https://images-api.nasa.gov/search?q=asteroid&description=${fullName}&media_type=image`;
        try {
          const response2 = await fetch(url2, options);
          if (!response2) {
            throw new BadRequestError("Invalid response from sbdb api");
          }
          const data2 = await response2.json();
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
            //trying to find image of particular asteroid
            const responseImage = await fetch(urlimage, options);
            if (!responseImage) {
              //handle lack of images
              image = "";
            }
            const dataImage = await responseImage.json();
            if (
              dataImage.collection.items.length === 0 ||
              dataImage === undefined
            ) {
              image = "";
            } else {
              //save first image from the list of images received from NASA API
              asteroidData.image =
                dataImage.collection.items[0]?.links[0]?.href;
            }
          } catch (error) {
            console.log(error);
            res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ message: "Failed to fetch data from images", error });
          }
          asteroidsData.push(asteroidData);
        } catch (error) {
          console.log("error", error);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Failed to fetch data from sbdb api", error });
        }
      }
    }
    res.status(StatusCodes.OK).json({ asteroidsData });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "There is no data with current parameters",
      error
    });
  }
});

// information comes from Astronomical Applications Department of the U.S. Naval Observatory API
const getSolarEclipsesData = asyncWrapper(async (req, res) => {
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
    data.eclipses_in_year.map((d) => (d.image = image));
    res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to fetch data", error });
  }
});

//information from local JSON files due to the lack of free APIs
const getLunarEclipsesData = (req, res) => {
  let image = "";
  let year = Number(req.params.year) || new Date().getFullYear();
  try {
    const response = lunarEclipses;
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const eclipsesByYear = response.filter((eclipse) =>
      eclipse.date.startsWith(year)
    );
    eclipsesByYear.map((eclipse) => (eclipse.image = image));
    res.status(StatusCodes.OK).json({ eclipsesByYear });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "There is no data with current parameters", error });
  }
};

//information from local JSON files due to the lack of free APIs
const getMeteorShowersData = (req, res) => {
  //map of images of meteor showers from NASA API (they have just a few images of meteor showers)
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
    if (!response) {
      throw new BadRequestError("Invalid response from API");
    }
    const showersByYear = response.filter((shower) =>
      shower.eventDate.startsWith(year)
    );
    if (showersByYear.length === 0) {
      throw new BadRequestError("No meteor showers found for the given year");
    } else {
      showersByYear.map(
        (shower) =>
          (shower.image =
            meteorShowersImgs[
              Math.floor(Math.random() * meteorShowersImgs.length)
            ])
      );
      res.status(StatusCodes.OK).json({ showersByYear });
    }
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "There is no data with current parameters", error });
  }
};

//picture of the day from NASA API for background image. Background image is different every day
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
