import { User } from "../models/user.Model"
import { redisClient } from "../config/redisConfig"

const setUserOnline = async (userId: string) => {
    try {

        await User.findByIdAndUpdate(userId, { status: "online" })
        await redisClient.hSet("user:status", userId, "online")
        redisClient.publish(
            "user-status",
            JSON.stringify({ userId, status: "online" })
        )
    } catch (error) {
        console.error(`Failed to set user ${userId} online:`, error)
    }
}

const setUserOffline = async (userId: string) => {
    try {

        const now = new Date()
        await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: now })
        await redisClient.hSet("user:status", userId, "offline")
        await redisClient.hSet("user:lastSeen", userId, now.toISOString())
        redisClient.publish(
            "user-status",
            JSON.stringify({ userId, status: "offline" })
        )
    } catch (error) {
        console.error(`Failed to set user ${userId} offline:`, error)
    }

}

export { setUserOffline, setUserOnline }
