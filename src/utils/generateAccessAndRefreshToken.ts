import { User } from "../models/user.Model";
import { ApiError } from "./ApiError";
import { Types } from "mongoose";

const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
    try {
        const user = await User.findById(userId);
        // => i got user
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating the access token",
        );
    }
};
export { generateAccessAndRefreshToken };
