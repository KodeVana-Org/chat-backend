//import { Server, Socket } from "socket.io"
//import { setUserOffline, setUserOnline } from "../middlewares/userStatus.middware";
//
//const handleUserStatus = (io: Server) => {
//    io.on("connection", (socket: Socket) => {
//        const userId = socket.handshake.query.userId as string;
//
//        if (!userId || typeof userId !== "string") {
//            console.error("No userId provided in connection")
//            return
//        }
//
//        //set user online
//        setUserOnline(userId)
//        console.log(`User ${userId} connected`)
//        //Notify other clients
//        io.emit("user-status", { userId, status: "online" })
//
//        socket.on("disconnect", () => {
//            //set user offline on disconnect
//            setUserOffline(userId)
//            console.log(`User ${userId}, disconnected`)
//            io.emit("user-status", { userId, status: "offline" })
//        })
//    })
//}
//
//export { handleUserStatus }
