import env from "./config/dotenvConfig";
import mongoose from "mongoose";
import { User } from "./models/user.Model";
import { connectToDatabase } from "./config/db";
import { httpServer } from "./app";
//import { connectRedis } from "./config/redisConfig";
import { io } from "./app";

const users: any = {} //for audio call


const initSocket = () => {

    console.log("Socket Initialized")

    io.on("connection", async (socket) => {
        console.log(`User connected: ${socket.id}`);


        //const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
        const userId = socket.handshake.query?.userId;
        console.log("I got userID from query handshake: ", userId)

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
            console.log("Invalid or missing User Id in query");
            //socket.disconnect(true);
            return;
        }

        // Set user status to online
        try {
            await User.findByIdAndUpdate(userId, { status: "online" });
            io.emit("updateUserStatus", { userId, status: "online" });
        } catch (error) {
            console.error("Error updating user status to online:", error);
            socket.disconnect(true);
            return;
        }

        // Notify everyone that this user is online
        io.emit("updateUserStatus", { userId, status: "online" });



        socket.on("joinConversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.id} joined room: ${conversationId}`);
        });

        //handle typing event
        socket.on("typing", ({ conversationId, senderId }) => {
            socket.to(conversationId).emit("userTyping", { senderId })
        })

        //handle stop tyong
        socket.on("stopTyping", ({ conversationId }) => {
            socket.to(conversationId).emit("userStopTyping")
        })

        socket.on("disconnect", async () => {
            console.log(`User disconnected: ${socket.id}`);
            if (userId) {
                const lastSeen = new Date();
                await User.findByIdAndUpdate(userId, { status: "offline", lastSeen });

                // Notify all clients about the updated status
                io.emit("updateUserStatus", { userId, status: "offline", lastSeen });
            }
        });
    });
}

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
        initSocket()

    } catch (error) {
        console.error("Faild to start the server: ", error)
        process.exit(1)
    }
})()
