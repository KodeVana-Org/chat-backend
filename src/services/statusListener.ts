import { redisClient } from "../config/redisConfig"

const listenUserStatus = async () => {
    const subscriber = redisClient.duplicate();
    await subscriber.connect()

    subscriber.subscribe("user-status", (message) => {
        const { userId, status } = JSON.parse(message)
        console.log(`User ${userId}, is now ${status}`)
    })

    subscriber.on("error", (err) => {
        console.error("Redis subsriber error:", err)
    })
}

export { listenUserStatus }
