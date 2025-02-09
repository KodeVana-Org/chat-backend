import { Router } from "express";
import { getAllUser } from "../controllers/user/getAllUser";
import { verifyToken } from "../services/verify-token";
import { Request, Response } from "express";
import { me } from "../controllers/user/me";
import { update_user_details } from "../controllers/user/update_user_details";
import { upload } from "../config/multerConfig";
//import { setUserOffline, setUserOnline } from "../middlewares/userStatus.middware";
import { ApiResponse } from "../utils/ApiResponse";
//import { redisClient } from "../config/redisConfig";
import { searchAllUser } from "../controllers/user/searchUser";
import { GetSingleUserById } from "../controllers/user/getUserById";
//import { createClient } from "redis";
//const redisClient = createClient()


const router = Router();


//search user
router.route("/search").get(searchAllUser);


router.route("/all-users/:userId").get(getAllUser);
router.route("/me").get(me);
router.route("/user/:userId").get(GetSingleUserById);
router.route("/update-user/:userId").patch(upload.fields([
    { name: 'image', maxCount: 1 }
]), update_user_details);
router.route("/protected").get(verifyToken, (req: Request, res: Response) => {
    res.status(200).json({ message: "Access granted", user: req.user })
})

//<-- OFFLINE OR ONLINE --> \\
//<--CHECK STATUS-->\\

//router.post("/online/:userId", async (req, res) => {
//    const { userId } = req.params;
//    await setUserOnline(userId)
//    return res
//        .status(200)
//        .json(new ApiResponse(200, {}, "user is now online"));
//})

//router.post("/offline/:userId", async (req, res) => {
//    const { userId } = req.params;
//    await setUserOffline(userId)
//    return res
//        .status(200)
//        .json(new ApiResponse(200, {}, "user is offline now"))
//})

//<-- FOR FETCHING STATUS INDIVIDUAL -->\\
//router.get("/user-status/:userId", async (req, res) => {
//    const { userId } = req.params;
//    try {
//        const status = await redisClient.hGet("user:status", userId)
//
//        if (!status) {
//            return res.status(404).json(new ApiResponse(200, {}, "user status not found"))
//        }
//        return res.status(200).json(new ApiResponse(200, { userId, status }, "Success"))
//    } catch (error) {
//        console.error("Error fetching user status:", error)
//        return res.status(500).json(new ApiResponse(500, {}, "Failed to fetch user status"))
//    }
//})

//router.get("/user-status", async (req, res) => {
//    try {
//        const statuses = await redisClient.hGetAll("user:status");
//        return res.status(200).json(new ApiResponse(200, statuses, "Success"))
//    } catch (error) {
//        console.error("Error fetcing users statuses:", error)
//        return res.status(500).json(new ApiResponse(500, {}, "Failed to fetch status"))
//    }
//})


export default router;
