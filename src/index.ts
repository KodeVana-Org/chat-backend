import env from "./config/dotenvConfig";
import { connectToDatabase } from "./config/db";
import { httpServer } from "./app";
import { connectRedis } from "./config/redisConfig";

const startServer = () => {
    httpServer.listen(env.PORT, () => {
        console.info(
            `Server is running at PORT ${process.env.PORT} in "${env.NODE_ENV}" MODE`,
        );
    });
};

(async () => {
    try {
        //connect to redis
        //await connectRedis()

        //connect to mongodb
        await connectToDatabase()

        //start the server
        startServer()

    } catch (error) {
        console.error("Faild to start the server: ", error)
        process.exit(1)
    }
})()


