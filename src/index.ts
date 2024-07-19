import env from "./config/dotenvConfig";
import { connectToDatabase } from "./config/db";
import { httpServer } from "./app";

const startServer = () => {
  httpServer.listen(env.PORT, () => {
    console.info(
      `Server is running at PORT ${process.env.PORT} in "${env.NODE_ENV}" MODE`,
    );
  });
};

connectToDatabase()
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.log("mongodb connection error: ", err);
  });
