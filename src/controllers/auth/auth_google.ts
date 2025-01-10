import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import axios from "axios";
import { User } from "../../models/user.Model";
import { generateAccessAndRefreshToken } from "../../utils/generateAccessAndRefreshToken";

const auth_google = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    try {

        //grab the token from body it will come from client
        const { token } = req.body;
        if (!token) {
            throw new ApiError(404, "Token not found");
        }

        let response: any;

        try {
            // Verify Google token
            const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
            response = googleResponse.data;

        } catch (error) {
            console.error("Error while verifying token", error);
            throw new ApiError(400, "Invalid Google token");
        }
        console.log(response)

        //check if the user {googleId} already registerd
        let user = await User.findOne({ googleId: response.sub });


        //if not exist then save the user into database
        if (!user) {
            user = new User({
                googleId: response.sub,
                email: response.email,
                username: response.name,
                password: "password",
                avatar: { url: response.picture }, //  avatar is an object
            });
            await user.save();
        }

        // here generate the tokens and send back to the client


        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
            user._id,
        );
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
        );
        try {
            return res
                .status(200)
                .cookie("accessToken", accessToken) // set the access token in the cookie
                .cookie("refreshToken", refreshToken) // set the refresh token in the cookie
                .json(
                    new ApiResponse(
                        200,
                        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
                        "User logged in successfully",
                    ),
                );
            //return res
            //    .status(200)
            //    .json(new ApiResponse(200, { user }, "User logged in  successfully"));
        } catch (error) {
            console.error("Error while logging in:", error);

            if (error instanceof ApiError) {
                return res
                    .status(error.statusCode)
                    .json(new ApiResponse(error.statusCode, {}, error.message));
            }
            return res
                .status(500)
                .json(new ApiResponse(500, {}, "An unexpected error occurred"));
        }
    } catch (error) {
        console.error("Error while login with google", error)
        return res.status(500).json({
            success: false,
            message: "Error while login",
        });

    }
})

export { auth_google };
