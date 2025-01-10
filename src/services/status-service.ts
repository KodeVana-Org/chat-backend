import { redisClient } from "../config/redisConfig"

const publishUserStatus = async (userId: string, status: "online" | "offline") => {
    await redisClient.publish("user-status", JSON.stringify({ userId, status }))
}

export { publishUserStatus }
