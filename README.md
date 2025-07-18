# The Sky Events App

The Sky Events is the Full Stack app, allows users to organize the sky events data they want to observe.
This is the Back End repository. The Front End repository: https://github.com/AnnaPestova1/Sky_Event_front

## Technologies

The Front End is built with `Vite React` and `Material UI`.
The Back end is built with `Node.js` with `Express JS`.
`MongoDB` is used as a storage database.

## Data sources (APIs)

- The app uses `NASA API` for the comets and asteroid data, and for images (partly)
- Astronomical Applications Department of the U.S. Naval Observatory API for Solar Eclipses data
- Lunar Eclipses and Meteorite Showers data are saved as local JSON files on Back End due to the lack of free APIs.

## Additional features

- Attempt to implement Google OAuth for authenticating and registering users
- Attempt to implement downloadable `.ics` file for the users to add events to their calendar.

## Links

- Main app URL: https://annapestova.onrender.com (deployed at Render)
- The Back End URL: https://annapestova-sky-events-back.onrender.com (deployed at Render)

## ENV file structure

`.env` file has the following structure:
MONGO_URI = (database URI)
MONGO_URI_TEST = (database URI for testing)
PORT = 3000
JWT_SECRET =
JWT_LIFETIME =
SESSION_SECRET=
NASA_API_KEY=(free key from NASA for some APIs)
CLIENT_ID = (Google OAuth client_id)
CLIENT_SECRET = (Google OAuth client_secret)
REDIRECT_URI = http://localhost:3000/api/v1/auth/oauth/google
REDIRECT_OAUTH_URI = http://localhost:5175
