import redis, { createClient } from "redis"
import { listenUserStatus } from "../services/statusListener"

//--> THIS IS REDIS CONFIGURATION <--\\

const redisClient = createClient({
    url: "redis://localhost:6379"
})

redisClient.on("connect", () => {
    console.log("Connected to Redis")
    listenUserStatus()
})

redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});

const connectRedis = async () => {
    try {
        await redisClient.connect()
        console.log("Redis client connected successfully")
    } catch (error) {
        console.error("Failed to connect Redis:", error)
        process.exit(1)
    }
}

export { redisClient, connectRedis }
